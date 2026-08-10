from fastapi import APIRouter
from app.services.question_generator import QuestionGenerator

router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)


@router.post("/generate")
def generate_questions(interview_plan: dict):

    generator = QuestionGenerator()

    questions = generator.generate_questions(interview_plan)

    return questions