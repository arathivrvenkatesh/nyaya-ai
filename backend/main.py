from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from services.nlp import analyze_legal_problem, get_helplines
import os

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="NYAYA AI",
    description="Legal Rights Assistant for the Underprivileged",
    version="1.0.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model
class ProblemInput(BaseModel):
    text: str
    language: str = "english"

# Test route
@app.get("/")
def home():
    return {
        "message": "Welcome to NYAYA AI",
        "status": "running"
    }

# Health check route
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "groq_key": "set" if os.getenv("GROQ_API_KEY") else "missing",
        "huggingface_key": "set" if os.getenv("HUGGINGFACE_TOKEN") else "missing",
        "mongodb": "set" if os.getenv("MONGODB_URL") else "missing"
    }

# Main analyze route
@app.post("/analyze")
def analyze(input: ProblemInput):
    # Analyze the problem
    result = analyze_legal_problem(input.text)

    # Get helplines based on category and urgency
    helplines = get_helplines(result["category"], result["urgent"])

    # Add mental health support if stress score is high
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
class LetterInput(BaseModel):
    text: str
    category: str
    law_sections: list
    user_name: str = "The Complainant"
    user_address: str = "Address of Complainant"

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
    return {
        "success": True,
        "letter": letter
    }
@app.get("/legal-centers")
def legal_centers(city: str = None):
    from services.legal_aid import find_nearest_centers
    centers = find_nearest_centers(city)
    return {
        "success": True,
        "centers": centers,
        "total": len(centers)
    }
