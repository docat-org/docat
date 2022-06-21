"""
docat
~~~~~

Host your docs. Simple. Versioned. Fancy.

:copyright: (c) 2019 by docat, https://github.com/docat-org/docat
:license: MIT, see LICENSE for more details.
"""
import os
import secrets
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, File, Header, Response, UploadFile, status
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.responses import JSONResponse
from tinydb import Query, TinyDB

from docat.utils import DB_PATH, UPLOAD_FOLDER, calculate_token, create_nginx_config, create_symlink, extract_archive, remove_docs

#: Holds the FastAPI application
app = FastAPI(
    title="docat",
    description="API for docat, https://github.com/docat-org/docat",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)
#: Holds an instance to the TinyDB
DOCAT_DB_PATH = os.getenv("DOCAT_DB_PATH", DB_PATH)
db = TinyDB(DOCAT_DB_PATH)
#: Holds the static base path where the uploaded documentation artifacts are stored
DOCAT_UPLOAD_FOLDER = Path(os.getenv("DOCAT_DOC_PATH", UPLOAD_FOLDER))


def get_db():
    """Return the cached TinyDB instance."""
    return db


@dataclass(frozen=True)
class TokenStatus:
    valid: bool
    reason: Optional[str] = None


class ApiResponse(BaseModel):
    message: str


class ClaimResponse(ApiResponse):
    token: str


@app.post("/api/{project}/{version}", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def upload(
    project: str,
    version: str,
    response: Response,
    file: UploadFile = File(...),
    docat_api_key: Optional[str] = Header(None),
    db: TinyDB = Depends(get_db),
):
    project_base_path = DOCAT_UPLOAD_FOLDER / project
    base_path = project_base_path / version
    target_file = base_path / file.filename

    if base_path.exists():
        token_status = check_token_for_project(db, docat_api_key, project)
        if token_status.valid:
            remove_docs(project, version)
        else:
            response.status_code = status.HTTP_401_UNAUTHORIZED
            return ApiResponse(message=token_status.reason)

    # ensure directory for the uploaded doc exists
    base_path.mkdir(parents=True, exist_ok=True)

    # save the uploaded documentation
    file.file.seek(0)
    with target_file.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extract_archive(target_file, base_path)
    create_nginx_config(project, project_base_path)
    return ApiResponse(message="File successfully uploaded")


@app.put("/api/{project}/{version}/tags/{new_tag}", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def tag(project: str, version: str, new_tag: str, response: Response):
    destination = DOCAT_UPLOAD_FOLDER / project / new_tag

    if create_symlink(version, destination):
        return ApiResponse(message=f"Tag {new_tag} -> {version} successfully created")
    else:
        response.status_code = status.HTTP_409_CONFLICT
        return ApiResponse(message=f"Tag {new_tag} would overwrite an existing version!")


@app.get(
    "/api/{project}/claim",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED,
    responses={status.HTTP_409_CONFLICT: {"model": ApiResponse}},
)
def claim(project: str, db: TinyDB = Depends(get_db)):
    Project = Query()
    table = db.table("claims")
    result = table.search(Project.name == project)
    if result:
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": f"Project {project} is already claimed!"})

    token = secrets.token_hex(16)
    salt = os.urandom(32)
    token_hash = calculate_token(token, salt)
    table.insert({"name": project, "token": token_hash, "salt": salt.hex()})

    return ClaimResponse(message=f"Project {project} successfully claimed", token=token)


@app.delete("/api/{project}/{version}", response_model=ApiResponse, status_code=status.HTTP_200_OK)
def delete(project: str, version: str, response: Response, docat_api_key: str = Header(None), db: TinyDB = Depends(get_db)):
    token_status = check_token_for_project(db, docat_api_key, project)
    if token_status.valid:
        message = remove_docs(project, version)
        if message:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(message=message)
        else:
            return ApiResponse(message=f"Successfully deleted version '{version}'")
    else:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return ApiResponse(message=token_status.reason)


def check_token_for_project(db, token, project) -> TokenStatus:
    Project = Query()
    table = db.table("claims")
    result = table.search(Project.name == project)

    if result and token:
        token_hash = calculate_token(token, bytes.fromhex(result[0]["salt"]))
        if result[0]["token"] == token_hash:
            return TokenStatus(True)
        else:
            return TokenStatus(False, f"Docat-Api-Key token is not valid for {project}")
    else:
        return TokenStatus(False, f"Please provide a header with a valid Docat-Api-Key token for {project}")


# serve_local_docs for local testing without a nginx
if os.environ.get("DOCAT_SERVE_FILES"):
    app.mount("/doc", StaticFiles(directory=DOCAT_UPLOAD_FOLDER), name="docs")
