from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.candidate import CandidateResponse
from app.services.resume_service import ResumeService

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


@router.post("/upload", response_model=CandidateResponse)
def upload_resume(
    name: str = Form(...),
    email: str = Form(...),
    role: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Validate file type
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are allowed."
        )

    candidate = ResumeService.save_resume(
        db=db,
        name=name,
        email=email,
        role=role,
        resume=resume
    )

    return CandidateResponse(
        candidate_id=candidate.id,
        message="Resume uploaded successfully."
    )