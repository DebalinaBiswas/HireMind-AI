from app.rag.vector_store import VectorStore


class KnowledgeRetriever:

    def __init__(self):
        self.vector_store = VectorStore()

    def retrieve(self, query: str, role: str, top_k: int = 5):

        results = self.vector_store.search_role(
            query=query,
            role=role,
            top_k=top_k,
        )

        documents = results.get("documents", [])

        if not documents or not documents[0]:
            return ""

        return "\n\n".join(documents[0])