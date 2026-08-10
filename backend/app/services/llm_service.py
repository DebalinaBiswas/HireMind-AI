import json
from google import genai
from app.core.logger import logger
from app.core.config import settings
import time
from google.genai.errors import ServerError

class LLMService:

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        logger.info(f"Using Gemini model: {settings.GEMINI_MODEL}")
    def _generate_content(self, prompt: str):
        """
        Calls Gemini with automatic retry on temporary server errors.
        """

        max_retries = 3

        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                )
                return response

            except ServerError:
                if attempt == max_retries - 1:
                    raise

                logger.warning(
                f"Gemini unavailable. Retrying ({attempt + 1}/{max_retries})..."
            )

            time.sleep(2)
    def _extract_json(self, text: str):
        """
        Cleans Gemini response and converts it into JSON.
        """

        text = text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "")

        if text.startswith("```"):
            text = text.replace("```", "")

        text = text.replace("```", "").strip()

        return json.loads(text)

    def analyze_resume(self, resume_text: str):
        """
        Extract structured information from a resume.
        """

        prompt = f"""
You are an expert technical recruiter.

Analyze the following resume.

Return ONLY valid JSON.

{{
    "name": "",
    "email": "",
    "phone": "",
    "skills": [],
    "projects": [],
    "education": [],
    "experience": [],
    "certifications": [],
    "strengths": [],
    "weaknesses": [],
    "career_focus": ""
}}

Resume:

{resume_text}
"""

        response =self._generate_content(prompt)

        return self._extract_json(response.text)

    def generate_with_context(self, question: str, context: str):
        """
        RAG generation using retrieved context.
        """

        prompt = f"""
You are an AI Technical Interview Assistant.

Answer ONLY using the provided context.

If the answer is not present in the context, reply:

"I don't have enough information."

========================

CONTEXT

{context}

========================

QUESTION

{question}
"""

        response = self._generate_content(prompt)
        return response.text.strip()

    def generate_json(self, prompt: str):
        """
        Sends a prompt to Gemini and returns JSON.
        """

        response = self._generate_content(prompt)

        return self._extract_json(response.text)