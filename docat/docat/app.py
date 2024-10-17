"""
docat
~~~~~

Host your docs. Simple. Versioned. Fancy.

:copyright: (c) 2019 by docat, https://github.com/docat-org/docat
:license: MIT, see LICENSE for more details.
"""

import logging
import os
import secrets
import shutil
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import magic
from fastapi import Depends, FastAPI, File, Header, Response, UploadFile, status
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from tinydb import Query, TinyDB

from docat.models import ApiResponse, ClaimResponse, ProjectDetail, Projects, Stats, TokenStatus
from docat.utils import (
    DB_PATH,
    UPLOAD_FOLDER,
    calculate_token,
    create_symlink,
    extract_archive,
    get_all_projects,
    get_project_details,
    get_system_stats,
    is_forbidden_project_name,
    remove_docs,
)

DOCAT_STORAGE_PATH = Path(os.getenv("DOCAT_STORAGE_PATH", Path("/var/docat")))
DOCAT_DB_PATH = DOCAT_STORAGE_PATH / DB_PATH
DOCAT_UPLOAD_FOLDER = DOCAT_STORAGE_PATH / UPLOAD_FOLDER

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Create the folders if they don't exist
    DOCAT_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    yield


def get_db() -> TinyDB:
    """Return the cached TinyDB instance."""
    return TinyDB(DOCAT_DB_PATH)


#: Holds the FastAPI application
app = FastAPI(
    title="docat",
    description="API for docat, https://github.com/docat-org/docat",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)


@app.get("/api/stats", response_model=Stats, status_code=status.HTTP_200_OK)
def get_stats():
    if not DOCAT_UPLOAD_FOLDER.exists():
        return Projects(projects=[])
    return get_system_stats(DOCAT_UPLOAD_FOLDER)


@app.get("/api/projects", response_model=Projects, status_code=status.HTTP_200_OK)
def get_projects(include_hidden: bool = False):
    if not DOCAT_UPLOAD_FOLDER.exists():
        return Projects(projects=[])
    return get_all_projects(DOCAT_UPLOAD_FOLDER, include_hidden)


@app.get(
    "/api/projects/{project}",
    response_model=ProjectDetail,
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_404_NOT_FOUND: {"model": ApiResponse}},
)
@app.get(
    "/api/projects/{project}/",
    response_model=ProjectDetail,
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_404_NOT_FOUND: {"model": ApiResponse}},
)
def get_project(project, include_hidden: bool = False):
    details = get_project_details(DOCAT_UPLOAD_FOLDER, project, include_hidden)

    if not details:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": f"Project {project} does not exist"})

    return details


@app.post("/api/{project}/icon", response_model=ApiResponse, status_code=status.HTTP_200_OK)
@app.post("/api/{project}/icon/", response_model=ApiResponse, status_code=status.HTTP_200_OK)
def upload_icon(
    project: str,
    response: Response,
    file: UploadFile = File(...),
    docat_api_key: Optional[str] = Header(None),
    db: TinyDB = Depends(get_db),
):
    project_base_path = DOCAT_UPLOAD_FOLDER / project
    icon_path = project_base_path / "logo"

    if not project_base_path.exists():
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=f"Project {project} not found")

    mime_type_checker = magic.Magic(mime=True)
    mime_type = mime_type_checker.from_buffer(file.file.read())

    if not mime_type.startswith("image/"):
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(message="Icon must be an image")

    # require a token if the project already has an icon
    if icon_path.is_file():
        token_status = check_token_for_project(db, docat_api_key, project)
        if not token_status.valid:
            response.status_code = status.HTTP_401_UNAUTHORIZED
            return ApiResponse(message=token_status.reason)

        # remove the old icon
        os.remove(icon_path)

    # save the uploaded icon
    file.file.seek(0)
    with icon_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return ApiResponse(message="Icon successfully uploaded")


@app.post("/api/{project}/{version}/hide", response_model=ApiResponse, status_code=status.HTTP_200_OK)
@app.post("/api/{project}/{version}/hide/", response_model=ApiResponse, status_code=status.HTTP_200_OK)
def hide_version(
    project: str,
    version: str,
    response: Response,
    docat_api_key: Optional[str] = Header(None),
    db: TinyDB = Depends(get_db),
):
    project_base_path = DOCAT_UPLOAD_FOLDER / project
    version_path = project_base_path / version
    hidden_file = version_path / ".hidden"

    if not project_base_path.exists():
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=f"Project {project} not found")

    if not version_path.exists():
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=f"Version {version} not found")

    if hidden_file.exists():
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(message=f"Version {version} is already hidden")

    token_status = check_token_for_project(db, docat_api_key, project)
    if not token_status.valid:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return ApiResponse(message=token_status.reason)

    with open(hidden_file, "w") as f:
        f.close()

    return ApiResponse(message=f"Version {version} is now hidden")


@app.post("/api/{project}/{version}/show", response_model=ApiResponse, status_code=status.HTTP_200_OK)
@app.post("/api/{project}/{version}/show/", response_model=ApiResponse, status_code=status.HTTP_200_OK)
def show_version(
    project: str,
    version: str,
    response: Response,
    docat_api_key: Optional[str] = Header(None),
    db: TinyDB = Depends(get_db),
):
    project_base_path = DOCAT_UPLOAD_FOLDER / project
    version_path = project_base_path / version
    hidden_file = version_path / ".hidden"

    if not project_base_path.exists():
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=f"Project {project} not found")

    if not version_path.exists():
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=f"Version {version} not found")

    if not hidden_file.exists():
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(message=f"Version {version} is not hidden")

    token_status = check_token_for_project(db, docat_api_key, project)
    if not token_status.valid:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return ApiResponse(message=token_status.reason)

    os.remove(hidden_file)

    return ApiResponse(message=f"Version {version} is now shown")


@app.post("/api/{project}/{version}", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
@app.post("/api/{project}/{version}/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def upload(
    project: str,
    version: str,
    response: Response,
    file: UploadFile = File(...),
    docat_api_key: Optional[str] = Header(None),
    db: TinyDB = Depends(get_db),
):
    if is_forbidden_project_name(project):
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(message=f'Project name "{project}" is forbidden, as it conflicts with pages in docat web.')

    if file.filename is None:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(message="Uploaded file is None aborting upload.")

    project_base_path = DOCAT_UPLOAD_FOLDER / project
    base_path = project_base_path / version
    target_file = base_path / str(file.filename)

    if base_path.is_symlink():
        # disallow overwriting of tags (symlinks) with new uploads
        response.status_code = status.HTTP_409_CONFLICT
        return ApiResponse(message="Cannot overwrite existing tag with new version.")

    if base_path.exists():
        token_status = check_token_for_project(db, docat_api_key, project)
        if not token_status.valid:
            response.status_code = status.HTTP_401_UNAUTHORIZED
            return ApiResponse(message=token_status.reason)

        remove_docs(project, version, DOCAT_UPLOAD_FOLDER)

    # ensure directory for the uploaded doc exists
    base_path.mkdir(parents=True, exist_ok=True)

    # save the uploaded documentation
    file.file.seek(0)
    with target_file.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        extract_archive(target_file, base_path)
    except Exception:
        logger.exception("Failed to unzip {target_file=}")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(message="Cannot extract zip file.")

    if not (base_path / "index.html").exists():
        return ApiResponse(message="Documentation uploaded successfully, but no index.html found at root of archive.")

    return ApiResponse(message="Documentation uploaded successfully")


@app.put("/api/{project}/{version}/tags/{new_tag}", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
@app.put("/api/{project}/{version}/tags/{new_tag}/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def tag(project: str, version: str, new_tag: str, response: Response):
    destination = DOCAT_UPLOAD_FOLDER / project / new_tag
    source = DOCAT_UPLOAD_FOLDER / project / version

    if not source.exists():
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=f"Version {version} not found")

    if not create_symlink(version, destination):
        response.status_code = status.HTTP_409_CONFLICT
        return ApiResponse(message=f"Tag {new_tag} would overwrite an existing version!")

    return ApiResponse(message=f"Tag {new_tag} -> {version} successfully created")


@app.get(
    "/api/{project}/claim",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED,
    responses={status.HTTP_409_CONFLICT: {"model": ApiResponse}},
)
@app.get(
    "/api/{project}/claim/",
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


@app.put("/api/{project}/rename/{new_project_name}", response_model=ApiResponse, status_code=status.HTTP_200_OK)
@app.put("/api/{project}/rename/{new_project_name}/", response_model=ApiResponse, status_code=status.HTTP_200_OK)
def rename(
    project: str,
    new_project_name: str,
    response: Response,
    docat_api_key: str = Header(None),
    db: TinyDB = Depends(get_db),
):
    if is_forbidden_project_name(new_project_name):
        response.status_code = status.HTTP_400_BAD_REQUEST
        return ApiResponse(message=f'New project name "{new_project_name}" is forbidden, as it conflicts with pages in docat web.')

    project_base_path = DOCAT_UPLOAD_FOLDER / project
    new_project_base_path = DOCAT_UPLOAD_FOLDER / new_project_name

    if not project_base_path.exists():
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=f"Project {project} not found")

    if new_project_base_path.exists():
        response.status_code = status.HTTP_409_CONFLICT
        return ApiResponse(message=f"New project name {new_project_name} already in use")

    token_status = check_token_for_project(db, docat_api_key, project)
    if not token_status.valid:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return ApiResponse(message=token_status.reason)

    # update the claim to the new project name
    Project = Query()
    claims_table = db.table("claims")
    claims_table.update({"name": new_project_name}, Project.name == project)

    os.rename(project_base_path, new_project_base_path)

    response.status_code = status.HTTP_200_OK
    return ApiResponse(message=f"Successfully renamed project {project} to {new_project_name}")


@app.delete("/api/{project}/{version}", response_model=ApiResponse, status_code=status.HTTP_200_OK)
@app.delete("/api/{project}/{version}/", response_model=ApiResponse, status_code=status.HTTP_200_OK)
def delete(
    project: str,
    version: str,
    response: Response,
    docat_api_key: str = Header(None),
    db: TinyDB = Depends(get_db),
):
    token_status = check_token_for_project(db, docat_api_key, project)
    if not token_status.valid:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return ApiResponse(message=token_status.reason)

    message = remove_docs(project, version, DOCAT_UPLOAD_FOLDER)
    if message:
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=message)

    return ApiResponse(message=f"Successfully deleted version '{version}'")


def check_token_for_project(db, token, project) -> TokenStatus:
    Project = Query()
    table = db.table("claims")
    result = table.search(Project.name == project)

    if result and token:
        token_hash = calculate_token(token, bytes.fromhex(result[0]["salt"]))
        if result[0]["token"] == token_hash:
            return TokenStatus(True, "Docat-Api-Key token is valid")
        else:
            return TokenStatus(False, f"Docat-Api-Key token is not valid for {project}")
    else:
        return TokenStatus(False, f"Please provide a header with a valid Docat-Api-Key token for {project}")


# serve_local_docs for local testing without a nginx
if os.environ.get("DOCAT_SERVE_FILES"):
    DOCAT_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    app.mount("/doc", StaticFiles(directory=DOCAT_UPLOAD_FOLDER, html=True), name="docs")
