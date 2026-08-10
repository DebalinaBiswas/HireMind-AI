import json

from app.rag.vector_store import VectorStore
from app.rag.knowledge_retriever import KnowledgeRetriever
from app.services.llm_service import LLMService
from app.services.query_builder import QueryBuilder


class QuestionGenerator:

    def __init__(self):
        self.vector_store = VectorStore()
        self.knowledge = KnowledgeRetriever()
        self.llm = LLMService()

    def generate_questions(
        self,
        interview_plan,
        parsed_resume,
        document_id,
        role,
    ):

        # ==========================================
        # Dynamic Retrieval Query
        # ==========================================
        search_query = QueryBuilder.build(
            parsed_resume,
            role,
        )

        print("\n========== GENERATED SEARCH QUERY ==========")
        print(search_query)

        # ==========================================
        # Resume Retrieval
        # ==========================================
        resume_results = self.vector_store.search(
            query=search_query,
            document_id=document_id,
            top_k=5,
        )

        resume_docs = resume_results.get("documents", [])

        if resume_docs and resume_docs[0]:
            resume_context = "\n\n".join(resume_docs[0])
            resume_chunks = resume_docs[0]
        else:
            resume_context = ""
            resume_chunks = []

        # ==========================================
        # Role Knowledge Retrieval
        # ==========================================
        role_results = self.vector_store.search_role(
            query=search_query,
            role=role,
            top_k=5,
        )

        role_docs = role_results.get("documents", [])

        if role_docs and role_docs[0]:
            role_context = "\n\n".join(role_docs[0])
            role_chunks = role_docs[0]
        else:
            role_context = ""
            role_chunks = []

        # ==========================================
        # Debug
        # ==========================================
        print("\n========== RESUME CONTEXT ==========")
        print(resume_context)

        print("\n========== ROLE KNOWLEDGE CONTEXT ==========")
        print(role_context)

        # ==========================================
        # Prompt
        # ==========================================
        prompt = f"""
You are an experienced AI interviewer.

Generate interview questions using BOTH:

1. Resume Context
2. Role Knowledge Context

Rules:

- Questions must relate to the candidate's resume.
- Questions must evaluate concepts from the role knowledge.
- Questions should reflect the selected role.
- Avoid generic questions.
- Difficulty should follow the interview plan.
- Do not invent resume details.
- Ground every question in the provided context.

==========================
RESUME CONTEXT
==========================

{resume_context}

==========================
ROLE KNOWLEDGE CONTEXT
==========================

{role_context}

==========================
INTERVIEW PLAN
==========================

{json.dumps(interview_plan, indent=2)}

Return ONLY valid JSON.

{{
    "questions": [
        {{
            "id": 1,
            "topic": "",
            "difficulty": "",
            "question": ""
        }}
    ]
}}
"""

        questions = self.llm.generate_json(prompt)

        print("\n========== GENERATED QUESTIONS ==========")
        print(json.dumps(questions, indent=2))

        # ==========================================
        # Traceability Information
        # ==========================================
        traceability = {
            "search_query": search_query,
            "resume_context": resume_context,
            "role_context": role_context,
            "resume_chunks": resume_chunks,
            "role_chunks": role_chunks,
        }

        return {
            "questions": questions,
            "traceability": traceability,
        }