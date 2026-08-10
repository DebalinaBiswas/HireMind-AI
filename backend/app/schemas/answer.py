from pydantic import BaseModel


class AnswerRequest(BaseModel):
    candidate_id: int
    question_id: int
    answer: str


class AnswerResponse(BaseModel):
    score: int
    technical_accuracy: int
    communication: int
    strengths: list[str]
    improvements: list[str]
    ideal_answer: str