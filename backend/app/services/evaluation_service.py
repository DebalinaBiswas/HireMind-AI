import json
import os

from app.models.answer import Answer
from app.models.candidate import Candidate

from app.rag.vector_store import VectorStore
from app.rag.knowledge_retriever import KnowledgeRetriever

from app.services.llm_service import LLMService
from app.services.query_builder import QueryBuilder


class EvaluationService:

    def __init__(self):
        self.vector_store = VectorStore()
        self.knowledge = KnowledgeRetriever()
        self.llm = LLMService()

    def evaluate(
        self,
        db,
        candidate_id: int,
        question_id: int,
        answer: str,
    ):

        candidate = (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

        if not candidate:
            raise Exception("Candidate not found")

        questions = candidate.interview_questions["questions"]

        question = None

        for q in questions:
            if q["id"] == question_id:
                question = q
                break

        if question is None:
            raise Exception("Question not found")

        document_id = os.path.basename(candidate.resume_path)

        # ---------------------------------------
        # Resume Retrieval
        # ---------------------------------------
        results = self.vector_store.search(
            query=question["question"],
            document_id=document_id,
            top_k=5,
        )

        docs = results.get("documents", [])

        if docs and docs[0]:
            context = "\n\n".join(docs[0])
        else:
            context = "No resume context."

        # ---------------------------------------
        # Role Knowledge Retrieval
        # ---------------------------------------
        search_query = QueryBuilder.build(
            candidate.parsed_resume,
            candidate.role,
        )

        role_context = self.knowledge.retrieve(
            query=search_query,
            role=candidate.role,
            top_k=5,
        )

        # ---------------------------------------
        # Evaluation Prompt
        # ---------------------------------------
        prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate answer using BOTH:

1. Resume Context
2. Role Knowledge

========================
Resume Context
========================

{context}

========================
Role Knowledge
========================

{role_context}

========================
Interview Question
========================

{question["question"]}

========================
Candidate Answer
========================

{answer}

Scoring Rules

- Evaluate ONLY the asked question.
- Ignore unrelated resume projects.
- Judge technical correctness.
- Judge communication.
- Use the role knowledge to determine correctness.
- Do not invent missing facts.

Return ONLY valid JSON.

{{
    "score": 0,
    "technical_accuracy": 0,
    "communication": 0,
    "strengths": [],
    "improvements": [],
    "ideal_answer": ""
}}
"""

        evaluation = self.llm.generate_json(prompt)

        db_answer = Answer(
            candidate_id=candidate_id,
            question_id=question_id,
            answer=answer,
            evaluation=evaluation,
        )

        db.add(db_answer)
        db.commit()

        return evaluation