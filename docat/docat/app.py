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
from pathlib import Path
from typing import Optional

import magic
from fastapi import Depends, FastAPI, File, Header, Response, UploadFile, status
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from tinydb import Query, TinyDB

from docat.models import (
    ApiResponse,
    ClaimResponse,
    ProjectDetail,
    Projects,
    SearchResponse,
    SearchResultFile,
    SearchResultProject,
    SearchResultVersion,
    TokenStatus,
)
from docat.utils import (
    DB_PATH,
    INDEX_PATH,
    UPLOAD_FOLDER,
    calculate_token,
    create_symlink,
    extract_archive,
    get_all_projects,
    get_project_details,
    index_all_projects,
    remove_docs,
    remove_file_index_from_db,
    remove_version_from_version_index,
    update_file_index_for_project_version,
    update_version_index_for_project,
)

#: Holds the FastAPI application
app = FastAPI(
    title="docat",
    description="API for docat, https://github.com/docat-org/docat",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

DOCAT_STORAGE_PATH = Path(os.getenv("DOCAT_STORAGE_PATH") or Path("/var/docat"))
DOCAT_DB_PATH = DOCAT_STORAGE_PATH / DB_PATH
DOCAT_INDEX_PATH = DOCAT_STORAGE_PATH / INDEX_PATH
DOCAT_UPLOAD_FOLDER = DOCAT_STORAGE_PATH / UPLOAD_FOLDER


@app.on_event("startup")
def startup_create_folders():
    # Create the folders if they don't exist
    DOCAT_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    DOCAT_DB_PATH.touch()
    DOCAT_INDEX_PATH.touch()


def get_db():
    """Return the cached TinyDB instance."""
    return TinyDB(DOCAT_DB_PATH)


@app.post("/api/index/update", response_model=ApiResponse, status_code=status.HTTP_200_OK)
@app.post("/api/index/update/", response_model=ApiResponse, status_code=status.HTTP_200_OK)
def update_index():
    index_all_projects(DOCAT_UPLOAD_FOLDER, DOCAT_INDEX_PATH)
    return ApiResponse(message="Successfully updated search index")


@app.get("/api/projects", response_model=Projects, status_code=status.HTTP_200_OK)
def get_projects():
    if not DOCAT_UPLOAD_FOLDER.exists():
        return Projects(projects=[])
    return get_all_projects(DOCAT_UPLOAD_FOLDER)


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
def get_project(project):
    details = get_project_details(DOCAT_UPLOAD_FOLDER, project)

    if not details:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": f"Project {project} does not exist"})

    return details


@app.get("/api/search", response_model=SearchResponse, status_code=status.HTTP_200_OK)
@app.get("/api/search/", response_model=SearchResponse, status_code=status.HTTP_200_OK)
def search(query: str):
    query = query.lower()
    found_projects: list[SearchResultProject] = []
    found_versions: list[SearchResultVersion] = []
    found_files: list[SearchResultFile] = []

    index_db = TinyDB(DOCAT_INDEX_PATH)
    project_table = index_db.table("projects")
    projects = project_table.all()
    all_versions: list[tuple] = []

    # Collect all projects that contain the query
    for project in projects:
        name = project.get("name")
        versions = project.get("versions")

        if not name or not versions:
            continue

        all_versions += ((name, version) for version in versions)

        if query in name.lower():
            project_res = SearchResultProject(name=name)
            found_projects.append(project_res)

    # Order by occurences of the query
    found_projects = sorted(found_projects, key=lambda x: x.name.count(query), reverse=True)

    # Collect all versions and tags that contain the query
    for (project, version) in all_versions:
        version_name = version.get("name")
        version_tags = version.get("tags")

        if query in version_name.lower():
            version_res = SearchResultVersion(project=project, version=version_name)
            found_versions.append(version_res)

        for tag in version_tags:
            if query in tag:
                tag_res = SearchResultVersion(version=tag, project=project)
                found_versions.append(tag_res)

    # Order by occurences of the query
    found_versions = sorted(found_versions, key=lambda x: x.version.count(query), reverse=True)

    # Collect all files whose name contains the query or whose content contains the query
    files_table = index_db.table("files")
    files = files_table.all()

    for file in files:
        file_content = file.get("content")
        file_path_str = file.get("path")
        file_project = file.get("project")
        file_project_version = file.get("version")

        if file_content is None or not file_path_str or not file_project or not file_project_version:
            continue

        file_path = Path(file_path_str)

        if query in file_path.name.lower():
            file_res = SearchResultFile(project=file_project, version=file_project_version, path=file_path_str)
            found_files.append(file_res)
            continue  # Skip content search if the file name already matches

        if file_path.suffix == ".html" and query in file_content.lower():
            file_res = SearchResultFile(project=file_project, version=file_project_version, path=file_path_str)
            found_files.append(file_res)

    return SearchResponse(projects=found_projects, versions=found_versions, files=found_files)


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

    update_version_index_for_project(DOCAT_UPLOAD_FOLDER, DOCAT_INDEX_PATH, project)
    remove_file_index_from_db(DOCAT_INDEX_PATH, project, version)

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

    update_version_index_for_project(DOCAT_UPLOAD_FOLDER, DOCAT_INDEX_PATH, project)
    update_file_index_for_project_version(DOCAT_UPLOAD_FOLDER, DOCAT_INDEX_PATH, project, version)

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
    project_base_path = DOCAT_UPLOAD_FOLDER / project
    base_path = project_base_path / version
    target_file = base_path / file.filename

    if base_path.is_symlink():
        # disallow overwriting of tags (symlinks) with new uploads
        response.status_code = status.HTTP_409_CONFLICT
        return ApiResponse(message="Cannot overwrite existing tag with new version.")

    if base_path.exists():
        token_status = check_token_for_project(db, docat_api_key, project)
        if token_status.valid:
            remove_docs(project, version, DOCAT_UPLOAD_FOLDER)
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
    update_version_index_for_project(DOCAT_UPLOAD_FOLDER, DOCAT_INDEX_PATH, project)
    update_file_index_for_project_version(DOCAT_UPLOAD_FOLDER, DOCAT_INDEX_PATH, project, version)
    return ApiResponse(message="File successfully uploaded")


@app.put("/api/{project}/{version}/tags/{new_tag}", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
@app.put("/api/{project}/{version}/tags/{new_tag}/", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
def tag(project: str, version: str, new_tag: str, response: Response):
    destination = DOCAT_UPLOAD_FOLDER / project / new_tag
    source = DOCAT_UPLOAD_FOLDER / project / version

    if not source.exists():
        response.status_code = status.HTTP_404_NOT_FOUND
        return ApiResponse(message=f"Version {version} not found")

    if create_symlink(version, destination):
        update_version_index_for_project(DOCAT_UPLOAD_FOLDER, DOCAT_INDEX_PATH, project)
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
def rename(project: str, new_project_name: str, response: Response, docat_api_key: str = Header(None), db: TinyDB = Depends(get_db)):
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

    # update the version index to the new project name
    index_db = TinyDB(DOCAT_INDEX_PATH)
    Project = Query()
    project_table = index_db.table("projects")
    project_table.update({"name": new_project_name}, Project.name == project)

    # update the file index to the new project name
    File = Query()
    file_table = index_db.table("files")
    file_table.update({"project": new_project_name}, File.project == project)

    os.rename(project_base_path, new_project_base_path)

    response.status_code = status.HTTP_200_OK
    return ApiResponse(message=f"Successfully renamed project {project} to {new_project_name}")


@app.delete("/api/{project}/{version}", response_model=ApiResponse, status_code=status.HTTP_200_OK)
@app.delete("/api/{project}/{version}/", response_model=ApiResponse, status_code=status.HTTP_200_OK)
def delete(project: str, version: str, response: Response, docat_api_key: str = Header(None), db: TinyDB = Depends(get_db)):
    token_status = check_token_for_project(db, docat_api_key, project)
    if token_status.valid:
        message = remove_docs(project, version, DOCAT_UPLOAD_FOLDER)
        if message:
            response.status_code = status.HTTP_404_NOT_FOUND
            return ApiResponse(message=message)
        else:
            remove_version_from_version_index(DOCAT_INDEX_PATH, project, version)
            remove_file_index_from_db(DOCAT_INDEX_PATH, project, version)
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
    DOCAT_UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    app.mount("/doc", StaticFiles(directory=DOCAT_UPLOAD_FOLDER, html=True), name="docs")

# index local files on start
if os.environ.get("DOCAT_INDEX_FILES"):
    index_all_projects(DOCAT_UPLOAD_FOLDER, DOCAT_INDEX_PATH)
