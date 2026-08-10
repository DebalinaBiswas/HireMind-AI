import chromadb

from app.rag.embedding_service import EmbeddingService


class VectorStore:

    def __init__(self):
        self.client = chromadb.PersistentClient(path="chroma_db")

        self.collection = self.client.get_or_create_collection(
            name="resumes"
        )

        self.embedder = EmbeddingService()

    # ==========================
    # Resume Storage
    # ==========================
    def add_document(self, document_id: str, chunks: list[str]):

        embeddings = self.embedder.embed(chunks)

        ids = [f"{document_id}_{i}" for i in range(len(chunks))]

        metadatas = [
            {
                "document_id": document_id,
                "chunk": i,
            }
            for i in range(len(chunks))
        ]

        self.collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    # ==========================
    # Role Knowledge Base Storage
    # ==========================
    def add_role_document(
        self,
        role: str,
        source: str,
        document_id: str,
        chunks: list[str],
    ):

        embeddings = self.embedder.embed(chunks)

        ids = [f"{document_id}_{i}" for i in range(len(chunks))]

        metadatas = [
            {
                "role": role,
                "source": source,
                "document_id": document_id,
                "chunk": i,
            }
            for i in range(len(chunks))
        ]

        self.collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    # ==========================
    # Resume Search
    # ==========================
    def search(
        self,
        query: str,
        document_id: str,
        top_k: int = 5,
    ):

        query_embedding = self.embedder.embed([query])[0]

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"document_id": document_id},
        )

        return results

    # ==========================
    # Role Knowledge Search
    # ==========================
    def search_role(
        self,
        query: str,
        role: str,
        top_k: int = 5,
    ):

        query_embedding = self.embedder.embed([query])[0]

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where={"role": role},
        )

        return results