from dataclasses import dataclass

from pydantic import BaseModel


@dataclass(frozen=True)
class TokenStatus:
    valid: bool
    reason: str | None = None


class ApiResponse(BaseModel):
    message: str


class ClaimResponse(ApiResponse):
    token: str


class ProjectVersion(BaseModel):
    name: str
    tags: list[str]
    hidden: bool


class Project(BaseModel):
    name: str
    logo: bool
    versions: list[ProjectVersion]


class Projects(BaseModel):
    projects: list[Project]


class ProjectDetail(BaseModel):
    name: str
    versions: list[ProjectVersion]


class SearchResultProject(BaseModel):
    name: str


class SearchResultVersion(BaseModel):
    project: str
    version: str


class SearchResultFile(BaseModel):
    project: str
    version: str
    path: str


class SearchResponse(BaseModel):
    projects: list[SearchResultProject]
    versions: list[SearchResultVersion]
    files: list[SearchResultFile]
