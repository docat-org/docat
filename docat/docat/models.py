from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel


@dataclass(frozen=True)
class TokenStatus:
    valid: bool
    reason: str


class ApiResponse(BaseModel):
    message: str


class ClaimResponse(ApiResponse):
    token: str


class ProjectVersion(BaseModel):
    name: str
    timestamp: datetime
    tags: list[str]
    hidden: bool


class Project(BaseModel):
    name: str
    logo: bool
    versions: list[ProjectVersion]


class Projects(BaseModel):
    projects: list[Project]


class Stats(BaseModel):
    n_projects: int
    n_versions: int
    storage: str


EmptyStats = Stats(n_projects=0, n_versions=0, storage="0 bytes")


class ProjectDetail(BaseModel):
    name: str
    versions: list[ProjectVersion]
