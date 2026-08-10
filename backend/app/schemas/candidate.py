from pydantic import BaseModel, EmailStr


class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    role: str


class CandidateResponse(BaseModel):
    candidate_id: int
    message: str