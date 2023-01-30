"""
docat utilities
"""
import hashlib
import os
import shutil
from concurrent.futures import ALL_COMPLETED, ProcessPoolExecutor, wait
from pathlib import Path
from zipfile import ZipFile

from bs4 import BeautifulSoup
from bs4.element import Comment
from tinydb import Query, TinyDB

from docat.models import Project, ProjectDetail, Projects, ProjectVersion

NGINX_CONFIG_PATH = Path("/etc/nginx/locations.d")
UPLOAD_FOLDER = "doc"
DB_PATH = "db.json"
INDEX_PATH = "index.json"


def create_symlink(source, destination):
    """
    Create a symlink from source to destination, if the
    destination is already a symlink, it will be overwritten.

    Args:
        source (pathlib.Path): path to the source
        destination (pathlib.Path): path to the destination
    """
    if not destination.exists() or (destination.exists() and destination.is_symlink()):
        if destination.is_symlink():
            destination.unlink()  # overwrite existing tag
        destination.symlink_to(source)
        return True
    else:
        return False


def extract_archive(target_file, destination):
    """
    Extracts the given archive to the directory
    and deletes the source afterwards.

    Args:
        target_file (pathlib.Path): target archive
        destination: (pathlib.Path): destination of the extracted archive
    """
    if target_file.suffix == ".zip":
        # this is required to extract zip files created
        # on windows machines (https://stackoverflow.com/a/52091659/12356463)
        os.path.altsep = "\\"
        with ZipFile(target_file, "r") as zipf:
            zipf.extractall(path=destination)
        target_file.unlink()  # remove the zip file


def remove_docs(project: str, version: str, upload_folder_path: Path):
    """
    Delete documentation

    Args:
        project (str): name of the project
        version (str): project version
    """
    docs = upload_folder_path / project / version
    if docs.exists():
        # remove the requested version
        # rmtree can not remove a symlink
        if docs.is_symlink():
            docs.unlink()
        else:
            shutil.rmtree(docs)

        # remove dead symlinks
        for link in (s for s in docs.parent.iterdir() if s.is_symlink()):
            if not link.resolve().exists():
                link.unlink()

        # remove empty projects
        if not [d for d in docs.parent.iterdir() if d.is_dir()]:
            docs.parent.rmdir()
            nginx_config = NGINX_CONFIG_PATH / f"{project}-doc.conf"
            if nginx_config.exists():
                nginx_config.unlink()
    else:
        return f"Could not find version '{docs}'"


def calculate_token(password, salt):
    """
    Wrapper function for pbkdf2_hmac to ensure consistent use of
    hash digest algorithm and iteration count.

    Args:
        password (str): the password to hash
        salt (byte): the salt used for the password
    """
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000).hex()


def is_forbidden_project_name(name: str) -> bool:
    """
    Checks if the given project name is forbidden.
    The project name is forbidden if it conflicts with
    a page on the docat website.
    """
    name = name.lower().strip()
    return name in ["upload", "claim", "delete", "search", "help"]


def get_all_projects(upload_folder_path: Path, include_hidden: bool) -> Projects:
    """
    Returns all projects in the upload folder.
    """
    projects: list[Project] = []

    for project in upload_folder_path.iterdir():
        if not project.is_dir():
            continue

        details = get_project_details(upload_folder_path, project.name, include_hidden)

        if details is None:
            continue

        if len(details.versions) < 1:
            continue

        project_name = str(project.relative_to(upload_folder_path))
        project_has_logo = (upload_folder_path / project / "logo").exists()
        projects.append(Project(name=project_name, logo=project_has_logo, versions=details.versions))

    return Projects(projects=projects)


def get_project_details(upload_folder_path: Path, project_name: str, include_hidden: bool) -> ProjectDetail | None:
    """
    Returns all versions and tags for a project.
    """
    docs_folder = upload_folder_path / project_name

    if not docs_folder.exists():
        return None

    tags = [x for x in docs_folder.iterdir() if x.is_dir() and x.is_symlink()]

    def should_include(name: str) -> bool:
        if include_hidden:
            return True

        return not (docs_folder / name / ".hidden").exists()

    return ProjectDetail(
        name=project_name,
        versions=sorted(
            [
                ProjectVersion(
                    name=str(x.relative_to(docs_folder)),
                    tags=[str(t.relative_to(docs_folder)) for t in tags if t.resolve() == x],
                    hidden=(docs_folder / x.name / ".hidden").exists(),
                )
                for x in docs_folder.iterdir()
                if x.is_dir() and not x.is_symlink() and should_include(x.name)
            ],
            key=lambda k: k.name,
            reverse=True,
        ),
    )


def index_all_projects(
    upload_folder_path: Path,
    index_db_path: Path,
):
    """
    This will extract all content from all versions for each project,
    and save it into into several temporary index databases (one for each project).
    It then combines all of these databases into one, and moves it to the final location.
    """
    temporary_db_path = upload_folder_path / "tmp-index.json"
    is_indexing_running = temporary_db_path.exists()

    if is_indexing_running:
        return

    temporary_db_path.touch()

    all_projects = get_all_projects(upload_folder_path, include_hidden=False).projects

    try:
        index_projects_in_parallel(upload_folder_path, all_projects)
        combine_temporary_index_databases(upload_folder_path, temporary_db_path, all_projects)

        temporary_db_path.replace(index_db_path)
    finally:
        if temporary_db_path.exists():
            temporary_db_path.unlink()


def index_projects_in_parallel(upload_folder_path: Path, projects: list[Project]):
    """
    Starts a thread for each project so they're indexed in parallel and returns when all are done.
    """
    with ProcessPoolExecutor() as executor:
        futures = [executor.submit(index_project, upload_folder_path, idx, project) for idx, project in enumerate(projects)]
        wait(futures, return_when=ALL_COMPLETED)


def index_project(upload_folder_path: Path, index: int, project: Project):
    """
    Indexes a project and saves it to the given index
    """
    project_db_path = upload_folder_path / f"tmp-index-{index}.json"

    if project_db_path.exists():
        project_db_path.unlink()

    with TinyDB(project_db_path) as project_index_db:
        update_version_index_for_project(upload_folder_path, project_index_db, project.name)
        update_file_index_for_project(upload_folder_path, project_index_db, project.name)


def combine_temporary_index_databases(upload_folder_path: Path, final_db_path: Path, projects: list[Project]):
    """
    Combines all temporary index databases into one
    """

    file_docs: list[dict] = []
    project_docs: list[dict] = []

    for i in range(len(projects)):
        project_index_db_path = upload_folder_path / f"tmp-index-{i}.json"

        if not project_index_db_path.exists():
            continue

        try:
            with TinyDB(project_index_db_path) as tmp_db:
                file_docs += [dict(file) for file in tmp_db.table("files").all()]
                project_docs += [dict(project) for project in tmp_db.table("projects").all()]
        finally:
            if project_index_db_path.exists():
                project_index_db_path.unlink()

    with TinyDB(final_db_path) as final_db:
        final_db.table("files").insert_multiple(file_docs)
        final_db.table("projects").insert_multiple(project_docs)


def update_file_index_for_project(upload_folder_path: Path, index_db: TinyDB, project: str):
    """
    Rebuilds the file index for all versions of the given project
    """
    files_table = index_db.table("files")
    files_table.remove(Query().project == project)

    project_details = get_project_details(upload_folder_path, project, include_hidden=False)

    if not project_details:
        return

    for version in project_details.versions:
        update_file_index_for_project_version(upload_folder_path, index_db, project, version.name)


def update_file_index_for_project_version(upload_folder_path: Path, index_db: TinyDB, project: str, version: str):
    """
    Removes existing indexes, and rebuilds it with the name of the contained files, and their content for html files.
    """
    docs_folder = upload_folder_path / project / version

    if not docs_folder.exists():
        return

    remove_file_index_from_db(index_db, project, version)

    for file in docs_folder.rglob("*"):
        if not file.is_file():
            continue

        # save the file path
        path = str(file.relative_to(docs_folder))
        content = get_html_content(file) if file.name.endswith(".html") else ""

        insert_file_index_into_db(index_db, project, version, path, content)


def update_version_index_for_project(upload_folder_path: Path, index_db: TinyDB, project: str):
    """
    Removes existing version indexes for the given project.
    It saves all existing versions and tags to the indexdb.
    """
    project_table = index_db.table("projects")
    Project = Query()
    project_table.remove(Project.name == project)

    details = get_project_details(upload_folder_path, project, include_hidden=False)

    if not details:
        return

    for version in details.versions:
        insert_version_into_version_index(index_db, project, version.name, version.tags)


def get_html_content(file_path: Path) -> str:
    """
    Returns the content of a html file as a string.
    """

    def html_tag_visible(element):
        if element.parent.name in ["style", "script", "head", "title", "meta", "[document]"] or isinstance(element, Comment):
            return False

        return True

    file_content = file_path.read_text()
    soup = BeautifulSoup(file_content, "html.parser")
    text_content = filter(html_tag_visible, soup.findAll(string=True))
    content = " ".join(t.strip() for t in text_content).lower()

    return content


def insert_file_index_into_db(index_db: TinyDB, project: str, version: str, file_path: str, content: str):
    """
    Inserts a file index into the index.json.
    """
    files_table = index_db.table("files")
    files_table.insert({"path": file_path, "content": content, "project": project, "version": version})


def remove_file_index_from_db(index_db: TinyDB, project: str, version: str):
    """
    Removes the file index for the given project version
    """

    files_table = index_db.table("files")

    File = Query()
    files_table.remove(File.project == project and File.version == version)


def insert_version_into_version_index(index_db: TinyDB, project: str, version: str, tags: list[str]):
    """
    Inserts a project index into the index db.
    """
    projects_table = index_db.table("projects")
    Project = Query()
    found_projects = projects_table.search(Project.name == project)

    if not found_projects:
        # create
        projects_table.insert({"name": project, "versions": [{"name": version, "tags": tags}]})
        return

    existing_versions = found_projects[0].get("versions")

    if not existing_versions:
        return  # should not happen

    if version in (v.get("name") for v in existing_versions):
        # version already exists, remove so we can add it again, updating the tags
        existing_versions = list((v for v in existing_versions if v.get("name") != version))

    existing_versions.append({"name": version, "tags": tags})
    projects_table.update({"versions": existing_versions}, Project.name == project)


def remove_version_from_version_index(index_db: TinyDB, project: str, version: str):
    """
    Removes a version from the project index in the index db.
    """
    projects_table = index_db.table("projects")

    Project = Query()
    found_projects = projects_table.search(Project.name == project)

    if not found_projects:
        return

    found_versions = found_projects[0].get("versions")

    if not found_versions or version not in (v["name"] for v in found_versions):
        return

    if len(found_versions) == 1:
        projects_table.remove(Project.name == project)  # remove project if it has no versions left
        return

    version_to_remove = next(v for v in found_versions if v["name"] == version)

    if not version_to_remove:
        return  # shouldn't happen

    found_versions.remove(version_to_remove)
    projects_table.update({"versions": found_versions}, Project.name == project)
