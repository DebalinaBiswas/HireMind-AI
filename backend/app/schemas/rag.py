from pydantic import BaseModel


class RAGRequest(BaseModel):
    question: str
    document_id: str


class RAGResponse(BaseModel):
    question: str
    context: str
    answer: str