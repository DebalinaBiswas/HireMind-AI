from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func

from app.database.base import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, nullable=False)

    role = Column(String, nullable=False)

    resume_path = Column(String, nullable=False)

    parsed_resume = Column(JSON, nullable=True)

    interview_plan = Column(JSON, nullable=True)  
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    interview_questions = Column(JSON, nullable=True)
    retrieved_context = Column(JSON, nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )