from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.candidate_service import CandidateService
from app.models.candidate import Candidate


router = APIRouter(
    prefix="/api/v1/candidate",
    tags=["Candidate"],
)


# ============================================================
# GET CANDIDATE DASHBOARD
# ============================================================

@router.get("/{candidate_id}")
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    return CandidateService.get_candidate_dashboard(
        db=db,
        candidate_id=candidate_id
    )


# ============================================================
# GET GENERATED INTERVIEW QUESTIONS
# ============================================================

@router.get("/{candidate_id}/questions")
def get_candidate_questions(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found."
        )

    if not candidate.interview_questions:
        raise HTTPException(
            status_code=404,
            detail="Interview questions have not been generated yet."
        )

    questions = candidate.interview_questions

    # --------------------------------------------------------
    # QuestionGenerator returns:
    #
    # {
    #     "questions": [...],
    #     "traceability": {...}
    # }
    #
    # Handle the nested "questions" structure.
    # --------------------------------------------------------

    if isinstance(questions, dict):
        questions = questions.get("questions", [])

    if not isinstance(questions, list):
        raise HTTPException(
            status_code=500,
            detail="Invalid interview question data."
        )

    return {
        "candidate_id": candidate.id,
        "role": candidate.role,
        "questions": questions,
    }