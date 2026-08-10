from pydantic import BaseModel, EmailStr


class CandidateProfile(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None

    skills: list[str] = []

    projects: list[str] = []

    education: list[str] = []

    experience: list[str] = []

    certifications: list[str] = []

    strengths: list[str] = []

    weaknesses: list[str] = []

    career_focus: str | None = None