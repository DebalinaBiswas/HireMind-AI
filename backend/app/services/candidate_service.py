from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.candidate import Candidate
from app.models.answer import Answer


class CandidateService:

    @staticmethod
    def get_candidate_dashboard(db: Session, candidate_id: int):

        candidate = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not candidate:
            raise HTTPException(
                status_code=404,
                detail="Candidate not found"
            )

        answers = (
            db.query(Answer)
            .filter(Answer.candidate_id == candidate_id)
            .all()
        )

        report = None

        if answers:
            report = answers[-1].evaluation

        return {
            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "role": candidate.role,
                "resume_path": candidate.resume_path,
                "created_at": candidate.created_at,
            },
            "parsed_resume": candidate.parsed_resume,
            "interview_plan": candidate.interview_plan,
            "interview_questions": candidate.interview_questions,
            "answers": [
                {
                    "question_id": a.question_id,
                    "answer": a.answer,
                    "evaluation": a.evaluation,
                }
                for a in answers
            ],
            "report": report,
        }