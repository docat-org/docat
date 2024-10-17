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
    storage: str
    versions: list[ProjectVersion]


class Projects(BaseModel):
    projects: list[Project]


class Stats(BaseModel):
    n_projects: int
    n_versions: int
    storage: str


class ProjectDetail(BaseModel):
    name: str
    storage: str
    versions: list[ProjectVersion]
