import json

from app.services.llm_service import LLMService
from app.core.config import settings

class InterviewPlanner:

    def __init__(self):
        self.llm = LLMService()

    def create_plan(self, candidate_profile):

        prompt = f"""
You are an expert technical interviewer.

Based on this candidate profile, create an interview plan.

Candidate Profile:

{json.dumps(candidate_profile, indent=2)}

Return ONLY valid JSON.

Format:

{{
  "candidate_level": "",
  "interview_duration": 20,
  "total_questions": 10,
  "focus_areas": [],
  "interview_strategy": "",
  "topics":[
      {{
          "topic":"",
          "difficulty":"",
          "questions":0,
          "reason":""
      }}
  ]
}}
"""

        response = self.llm.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )

        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)