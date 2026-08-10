from app.rag.vector_store import VectorStore
from app.services.llm_service import LLMService


class RAGService:

    def __init__(self):
        self.vector_store = VectorStore()
        self.llm = LLMService()

    def ask(self, question: str, document_id: str):

        results = self.vector_store.search(
            query=question,
            document_id=document_id,
            top_k=5,
        )

        context = "\n\n".join(results["documents"][0])

        answer = self.llm.generate_with_context(
            question=question,
            context=context,
        )

        return {
            "question": question,
            "context": context,
            "answer": answer,
        }