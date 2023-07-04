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
    tags: list[str]
    hidden: bool
    upload_date: datetime


class Project(BaseModel):
    name: str
    logo: bool
    versions: list[ProjectVersion]


class Projects(BaseModel):
    projects: list[Project]


class ProjectDetail(BaseModel):
    name: str
    versions: list[ProjectVersion]
