import os
import time
import shutil
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.core.config import settings

from app.services.pdf_service import PDFService
from app.services.llm_service import LLMService
from app.services.interview_planner import InterviewPlanner
from app.services.question_generator import QuestionGenerator

from app.rag.chunker import Chunker
from app.rag.vector_store import VectorStore
from app.core.logger import logger

class ResumeService:

    @staticmethod
    def save_resume(
        db: Session,
        name: str,
        email: str,
        role: str,
        resume: UploadFile,
    ):

        # Create uploads directory
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        # Generate unique filename
        extension = os.path.splitext(resume.filename)[1]
        filename = f"{uuid4()}{extension}"

        file_path = os.path.join(settings.UPLOAD_DIR, filename)

        # Save uploaded resume
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

        # ----------------------------------------
        # Extract text from PDF
        # ----------------------------------------
        start = time.time()
        pdf_text = PDFService.extract_text(file_path)
        logger.info(
            f"PDF extraction completed in {time.time() - start:.2f} seconds"
        )
        if not pdf_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Unable to extract text from the uploaded resume."
            )

        # ----------------------------------------
        # RAG STEP 1 : Chunk Resume
        # ----------------------------------------
        chunker = Chunker()
        chunks = chunker.split_text(pdf_text)

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No chunks were created from the resume."
            )

        # ----------------------------------------
        # RAG STEP 2 : Store in ChromaDB
        # ----------------------------------------
        start = time.time()
        vector_store = VectorStore()
        vector_store.add_document(filename, chunks)

        logger.info(
            f"Resume embedding/indexing completed in {time.time() - start:.2f} seconds"
            )
        # ----------------------------------------
        # Resume Parsing
        # ----------------------------------------
        llm = LLMService()
        start = time.time()
        parsed_resume = llm.analyze_resume(pdf_text)

        #logger.info("Resume parsed successfully.")
        logger.info(
            f"Resume parsing completed in {time.time() - start:.2f} seconds"
        )
        # ----------------------------------------
        # Interview Planning
        # ----------------------------------------
        planner = InterviewPlanner()
        start = time.time()
        interview_plan = planner.create_plan(parsed_resume)

        #logger.info("Interview plan generated successfully.")
        logger.info(
            f"Interview planning completed in {time.time() - start:.2f} seconds"
        )
        # ----------------------------------------
        # Question Generation
        # ----------------------------------------
        generator = QuestionGenerator()
        start = time.time()
        result= generator.generate_questions(
        interview_plan,
        parsed_resume,
        filename,
        role,
        )
        logger.info(
            f"Question generation completed in {time.time() - start:.2f} seconds"
        )
        interview_questions = result["questions"]

        retrieved_context = result["traceability"]
        logger.info("========== GENERATED QUESTIONS ==========")
        logger.info(interview_questions)

        print("\n========== GENERATED QUESTIONS ==========")
        print(interview_questions)
        # ----------------------------------------
        # Save Candidate
        # ----------------------------------------
        candidate = Candidate(
            name=name,
            email=email,
            role=role,
            resume_path=file_path,
            parsed_resume=parsed_resume,
            interview_plan=interview_plan,
            interview_questions=interview_questions,
            retrieved_context=retrieved_context,
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        return candidate