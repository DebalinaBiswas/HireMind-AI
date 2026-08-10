from pydantic import BaseModel
from typing import List


class InterviewTopic(BaseModel):
    topic: str
    difficulty: str
    questions: int
    reason: str


class InterviewPlan(BaseModel):
    candidate_level: str
    interview_duration: int
    total_questions: int
    focus_areas: List[str]
    interview_strategy: str
    topics: List[InterviewTopic]