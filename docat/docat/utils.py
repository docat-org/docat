"""
docat utilities
"""
import hashlib
import os
import secrets
import shutil
from pathlib import Path
from zipfile import ZipFile

from tinydb import Query, TinyDB

from docat.constants import get_global_claim_salt, get_global_claim_token
from docat.models import Project, ProjectDetail, Projects, ProjectVersion

NGINX_CONFIG_PATH = Path("/etc/nginx/locations.d")
UPLOAD_FOLDER = "doc"
DB_PATH = "db.json"


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
    return name in ["upload", "claim", "delete", "help"]


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


def claim_project(project: str, db: TinyDB) -> str:
    """Claims a project.

    Args:
        project: The project name.
        db: The database to use.

    Raises:
        PermissionError: If the project has already been claimed.

    Returns:
        The claim token.
    """
    table = db.table("claims")

    # Check if the project has already been claimed
    if table.search(Query().name == project):
        raise PermissionError(f"Project {project} is already claimed!")

    # Check if the global claim token/salt is configured. Otherwise, use randomly generated values.
    token = get_global_claim_token() or secrets.token_hex(16)
    salt = get_global_claim_salt() or os.urandom(32)

    token_hash = calculate_token(token, salt)
    table.insert({"name": project, "token": token_hash, "salt": salt.hex()})

    return token
