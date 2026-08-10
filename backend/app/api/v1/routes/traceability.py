from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.candidate import Candidate

router = APIRouter(
    prefix="/api/v1/traceability",
    tags=["Traceability"],
)


@router.get("/{candidate_id}")
def get_traceability(
    candidate_id: int,
    db: Session = Depends(get_db),
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

    return {
        "candidate_id": candidate.id,
        "name": candidate.name,
        "role": candidate.role,
        "traceability": candidate.retrieved_context,
    }