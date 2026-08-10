from pydantic import BaseModel
from typing import List


class InterviewQuestion(BaseModel):
    id: int
    topic: str
    difficulty: str
    question: str
    expected_points: List[str]


class QuestionSet(BaseModel):
    questions: List[InterviewQuestion]