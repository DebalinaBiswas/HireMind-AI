from app.services.knowledge_base_service import KnowledgeBaseService

service = KnowledgeBaseService()

service.ingest_role(
    "knowledge_base/ai_ml",
    "ai_ml"
)

service.ingest_role(
    "knowledge_base/data_science",
    "data_science"
)

service.ingest_role(
    "knowledge_base/advanced_ml",
    "advanced_ml"
)

print("Knowledge base indexed successfully.")