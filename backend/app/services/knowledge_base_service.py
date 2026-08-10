import os
import uuid

from app.rag.document_loader import DocumentLoader
from app.rag.chunker import Chunker
from app.rag.vector_store import VectorStore


class KnowledgeBaseService:

    def __init__(self):
        self.loader = DocumentLoader()
        self.chunker = Chunker()
        self.vector_store = VectorStore()

    def ingest_role(self, role_folder: str, role_name: str):

        for file in os.listdir(role_folder):

            file_path = os.path.join(role_folder, file)

            print(f"Ingesting {file}")

            text = self.loader.load(file_path)

            chunks = self.chunker.split_text(text)

            document_id = str(uuid.uuid4())

            self.vector_store.add_role_document(
                role=role_name,
                source=file,
                document_id=document_id,
                chunks=chunks,
            )

        print(f"{role_name} knowledge base indexed successfully.")