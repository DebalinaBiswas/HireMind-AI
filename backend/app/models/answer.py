from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func

from app.database.base import Base


class Answer(Base):

    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)

    candidate_id = Column(
        Integer,
        ForeignKey("candidates.id"),
        nullable=False,
    )

    question_id = Column(Integer, nullable=False)

    answer = Column(String, nullable=False)

    evaluation = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )