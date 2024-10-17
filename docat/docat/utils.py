"""
docat utilities
"""

import hashlib
import os
import shutil
from datetime import datetime
from pathlib import Path
from zipfile import ZipFile, ZipInfo

from docat.models import Project, ProjectDetail, Projects, ProjectVersion, Stats

NGINX_CONFIG_PATH = Path("/etc/nginx/locations.d")
UPLOAD_FOLDER = "doc"
DB_PATH = "db.json"


def is_dir(self):
    """Return True if this archive member is a directory."""
    if self.filename.endswith("/"):
        return True
    # The ZIP format specification requires to use forward slashes
    # as the directory separator, but in practice some ZIP files
    # created on Windows can use backward slashes.  For compatibility
    # with the extraction code which already handles this:
    if os.path.altsep:
        return self.filename.endswith((os.path.sep, os.path.altsep))
    return False


# Patch is_dir to allow windows zip files to be
# extracted correctly
# see: https://github.com/python/cpython/issues/117084
ZipInfo.is_dir = is_dir  # type: ignore[method-assign]


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


UNITS_MAPPING = [
    (1 << 50, " PB"),
    (1 << 40, " TB"),
    (1 << 30, " GB"),
    (1 << 20, " MB"),
    (1 << 10, " KB"),
    (1, " byte"),
]


def readable_size(bytes: int) -> str:
    """
    Get human-readable file sizes.
    simplified version of https://pypi.python.org/pypi/hurry.filesize/

    https://stackoverflow.com/a/12912296/12356463
    """
    size_suffix = ""
    for factor, suffix in UNITS_MAPPING:
        if bytes >= factor:
            size_suffix = suffix
            break

    amount = int(bytes / factor)
    if size_suffix == " byte" and amount > 1:
        size_suffix = size_suffix + "s"

    if amount == 0:
        size_suffix = " bytes"

    return str(amount) + size_suffix


def directory_size(path: Path) -> int:
    return sum(file.stat().st_size for file in path.rglob("*") if file.is_file())


def get_system_stats(upload_folder_path: Path) -> Stats:
    """
    Return all docat statistics
    """
    return Stats(
        n_projects=len([p for p in upload_folder_path.iterdir() if p.is_dir()]),
        n_versions=sum(len([p for p in d.iterdir() if p.is_dir() and not p.is_symlink()]) for d in upload_folder_path.glob("*/")),
        storage=readable_size(directory_size(upload_folder_path)),
    )


def get_all_projects(upload_folder_path: Path, include_hidden: bool) -> Projects:
    """
    Returns all projects in the upload folder.
    """
    projects: list[Project] = []

    for project in sorted(upload_folder_path.iterdir()):
        if not project.is_dir():
            continue

        details = get_project_details(upload_folder_path, project.name, include_hidden)

        if details is None:
            continue

        if len(details.versions) < 1:
            continue

        project_name = str(project.relative_to(upload_folder_path))
        project_has_logo = (upload_folder_path / project / "logo").exists()
        projects.append(
            Project(
                name=project_name,
                logo=project_has_logo,
                versions=details.versions,
                storage=readable_size(directory_size(upload_folder_path / project)),
            )
        )

    return Projects(projects=projects)


def get_version_timestamp(version_folder: Path) -> datetime:
    """
    Returns the timestamp of a version
    """
    return datetime.fromtimestamp(version_folder.stat().st_ctime)


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
        storage=readable_size(directory_size(docs_folder)),
        versions=sorted(
            [
                ProjectVersion(
                    name=str(x.relative_to(docs_folder)),
                    tags=[str(t.relative_to(docs_folder)) for t in tags if t.resolve() == x],
                    timestamp=get_version_timestamp(x),
                    hidden=(docs_folder / x.name / ".hidden").exists(),
                )
                for x in docs_folder.iterdir()
                if x.is_dir() and not x.is_symlink() and should_include(x.name)
            ],
            key=lambda k: k.name,
            reverse=True,
        ),
    )
