from sentence_transformers import SentenceTransformer


class EmbeddingService:

    _model = None

    def __init__(self):
        if EmbeddingService._model is None:
            print("Loading embedding model for the first time...")
            EmbeddingService._model = SentenceTransformer(
                "all-MiniLM-L6-v2"
            )

        self.model = EmbeddingService._model

    def embed(self, texts: list[str]):
        return self.model.encode(texts).tolist()