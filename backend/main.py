from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from services.nlp import analyze_legal_problem, get_helplines
import os

load_dotenv()

app = FastAPI(
    title="NYAYA AI",
    description="Legal Rights Assistant for the Underprivileged",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProblemInput(BaseModel):
    text: str
    language: str = "english"

class LetterInput(BaseModel):
    text: str
    category: str
    law_sections: list
    user_name: str = "The Complainant"
    user_address: str = "Address of Complainant"

class SaveCaseInput(BaseModel):
    text: str
    category: str
    stress_score: int
    law_sections: list
    rights: str
    next_steps: str
    urgent: bool
    user_name: str = "Anonymous"
    city: str = "Unknown"

@app.get("/")
def home():
    return {"message": "Welcome to NYAYA AI", "status": "running"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "groq_key": "set" if os.getenv("GROQ_API_KEY") else "missing",
        "huggingface_key": "set" if os.getenv("HUGGINGFACE_TOKEN") else "missing",
        "mongodb": "set" if os.getenv("MONGODB_URL") else "missing"
    }

@app.post("/analyze")
def analyze(input: ProblemInput):
    result = analyze_legal_problem(input.text)
    helplines = get_helplines(result["category"], result["urgent"])
    mental_health_support = None
    if result["stress_score"] >= 7:
        mental_health_support = {
            "message": "We noticed you may be under significant stress.",
            "suggestion": "Please consider talking to someone.",
            "helpline": "iCall: 9152987821 (Mon-Sat 8AM-10PM)"
        }
    return {
        "success": True,
        "analysis": result,
        "helplines": helplines,
        "mental_health_support": mental_health_support
    }

@app.post("/generate-letter")
def generate_letter(input: LetterInput):
    from services.letter import generate_complaint_letter
    letter = generate_complaint_letter(
        user_text=input.text,
        category=input.category,
        law_sections=input.law_sections,
        user_name=input.user_name,
        user_address=input.user_address
    )
    return {"success": True, "letter": letter}

@app.get("/legal-centers")
def legal_centers(city: str = None):
    from services.legal_aid import find_nearest_centers
    centers = find_nearest_centers(city)
    return {"success": True, "centers": centers, "total": len(centers)}

@app.post("/save-case")
def save_case(input: SaveCaseInput):
    from services.database import save_case as db_save
    case_id = db_save(
        problem_text=input.text,
        category=input.category,
        stress_score=input.stress_score,
        law_sections=input.law_sections,
        rights=input.rights,
        next_steps=input.next_steps,
        urgent=input.urgent,
        user_name=input.user_name,
        city=input.city
    )
    return {"success": True, "case_id": case_id}

@app.get("/cases")
def get_cases():
    from services.database import get_all_cases
    cases = get_all_cases()
    return {"success": True, "cases": cases, "total": len(cases)}

@app.get("/stats")
def get_stats():
    from services.database import get_stats
    stats = get_stats()
    return {"success": True, "stats": stats}
from fastapi import UploadFile, File

@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str = "auto"
):
    from services.voice import transcribe_audio
    
    # Read audio file
    audio_bytes = await audio.read()
    audio_tuple = (audio.filename, audio_bytes, audio.content_type)
    
    result = transcribe_audio(audio_tuple, language if language != "auto" else None)
    
    return result