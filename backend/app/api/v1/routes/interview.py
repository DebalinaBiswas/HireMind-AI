from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.answer import AnswerRequest
from app.services.evaluation_service import EvaluationService

router = APIRouter(
    prefix="/api/v1/interview",
    tags=["Interview"],
)


@router.post("/evaluate")
def evaluate_answer(
    request: AnswerRequest,
    db: Session = Depends(get_db),
):

    service = EvaluationService()

    result = service.evaluate(
        db=db,
        candidate_id=request.candidate_id,
        question_id=request.question_id,
        answer=request.answer,
    )

    return result