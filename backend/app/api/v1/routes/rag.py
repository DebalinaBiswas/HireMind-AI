from fastapi import APIRouter

from app.schemas.rag import RAGRequest
from app.services.rag_service import RAGService

router = APIRouter(
    prefix="/rag",
    tags=["RAG"],
)

rag = RAGService()


@router.post("/ask")
def ask(request: RAGRequest):

    return rag.ask(
        question=request.question,
        document_id=request.document_id,
    )