from app.database.base import Base
from app.database.session import engine

# Import models so SQLAlchemy knows about them
from app.models.candidate import Candidate
from app.models.answer import Answer


def init_db():
    Base.metadata.create_all(bind=engine)