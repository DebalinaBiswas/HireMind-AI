# HireMind AI

HireMind AI is an AI-powered technical interview platform that generates personalized interview questions based on a candidate's resume, target role, and relevant technical knowledge.

The platform combines resume parsing, Retrieval-Augmented Generation (RAG), LLM-based question generation, answer evaluation, persistent database storage, and automated interview reporting into a complete interview workflow.

---

## Key Features

- Resume upload and PDF processing
- Candidate profile creation
- Resume-aware interview question generation
- Role-specific question generation
- Knowledge-base retrieval using RAG
- AI-generated technical interview questions
- Dynamic interview flow supporting any number of questions returned by the backend
- Individual answer evaluation
- Persistent candidate, question, and answer data
- AI-generated interview reports
- Technical and communication scoring
- Strengths and weaknesses analysis
- Final recommendation generation
- Interactive React frontend
- FastAPI REST backend
- Swagger/OpenAPI API documentation
- Traceability and RAG-related API endpoints
- Modular service-based backend architecture

---

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Google Gemini API
- LangChain / LLM-based processing
- RAG
- PDF processing
- Pydantic
- Uvicorn

### Frontend

- React
- Vite
- JavaScript
- CSS
- Axios

### AI / ML

- Large Language Models (LLMs)
- Retrieval-Augmented Generation (RAG)
- Resume parsing
- Semantic knowledge retrieval
- Context-aware question generation
- AI-based answer evaluation

### Development Tools

- Git
- GitHub
- VS Code
- Swagger / OpenAPI
- Postman

---
# Setup Instructions

## Prerequisites

Before running HireMind AI, make sure the following are installed:

- Python 3.10 or higher
- Node.js and npm
- Git
- Google Gemini API key

---

## 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/DebalinaBiswas/HireMind-AI.git
cd HireMind-AI

# System Architecture

HireMind AI follows a modular client-server architecture.

```text
                         ┌──────────────────────┐
                         │     Candidate        │
                         │  Resume + Target Role│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │       Vite           │
                         └──────────┬───────────┘
                                    │
                              REST API Calls
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │        FastAPI Backend       │
                    │                              │
                    │  API Routes / Controllers    │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
      ┌──────────────┐    ┌────────────────┐   ┌────────────────┐
      │ Resume       │    │ Question       │   │ Evaluation     │
      │ Processing   │    │ Generation     │   │ Service        │
      └──────┬───────┘    └───────┬────────┘   └───────┬────────┘
             │                    │                    │
             ▼                    ▼                    ▼
      ┌──────────────┐    ┌────────────────┐   ┌────────────────┐
      │ Resume       │    │ Query Builder  │   │ LLM Service    │
      │ Parser       │    │ + RAG          │   │                │
      └──────────────┘    └───────┬────────┘   └───────┬────────┘
                                  │                    │
                                  ▼                    ▼
                         ┌────────────────┐    ┌───────────────┐
                         │ Knowledge Base │    │ Gemini LLM    │
                         │ + Retrieval    │    │               │
                         └────────────────┘    └───────────────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │ Report Service │
                         └───────┬────────┘
                                 │
                                 ▼
                         ┌────────────────┐
                         │ SQLite Database │
                         │                │
                         │ Candidates     │
                         │ Questions      │
                         │ Answers        │
                         └────────────────┘
