from app.rag.vector_store import VectorStore


class Retriever:

    def __init__(self):
        self.vector_store = VectorStore()

    def retrieve(self, query: str, top_k: int = 5):

        results = self.vector_store.search(query, top_k)

        if not results["documents"]:
            return ""

        documents = results["documents"][0]

        return "\n\n".join(documents)