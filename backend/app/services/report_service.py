import json

from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.models.answer import Answer
from app.services.llm_service import LLMService


class ReportService:

    def __init__(self):
        self.llm = LLMService()

    def generate_report(self, db: Session, candidate_id: int):

        candidate = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not candidate:
            return {"error": "Candidate not found"}

        answers = (
            db.query(Answer)
            .filter(Answer.candidate_id == candidate_id)
            .all()
        )

        evaluations = []

        total_score = 0
        count = 0

        for ans in answers:

            evaluation = ans.evaluation or {}

            evaluations.append(evaluation)

            if isinstance(evaluation, dict):

                score = evaluation.get("score", 0)

                if isinstance(score, (int, float)):
                    total_score += score
                    count += 1

        average_score = round(total_score / count, 2) if count else 0

        prompt = f"""
You are an expert technical recruiter.

Candidate Resume:

{json.dumps(candidate.parsed_resume, indent=2)}

Interview Plan:

{json.dumps(candidate.interview_plan, indent=2)}

Interview Evaluations:

{json.dumps(evaluations, indent=2)}

Generate a FINAL interview report.

Return ONLY valid JSON.

{{
    "overall_score": {average_score},
    "technical_score": 0,
    "communication_score": 0,
    "strengths": [],
    "weaknesses": [],
    "recommendation": "",
    "summary": ""
}}
"""

        return self.llm.generate_json(prompt)