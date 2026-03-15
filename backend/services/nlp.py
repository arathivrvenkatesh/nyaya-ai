import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Legal categories we support
LEGAL_CATEGORIES = [
    "domestic violence",
    "workplace harassment",
    "wage theft",
    "police complaint",
    "consumer complaint",
    "land dispute",
    "dowry harassment",
    "child rights",
    "right to information",
    "other"
]

def analyze_legal_problem(user_text: str):
    """
    Takes user's problem description and returns:
    - Legal category
    - Relevant law sections
    - Stress score (1-10)
    - Summary of rights
    """

    prompt = f"""
You are NYAYA AI, a legal assistant for underprivileged Indians.
A user has described their problem below.

Your job is to analyze it and respond in this EXACT format:
CATEGORY: [one of: {', '.join(LEGAL_CATEGORIES)}]
STRESS_SCORE: [number from 1-10, based on emotional distress in the text]
LAW_SECTIONS: [relevant Indian law sections, comma separated]
RIGHTS: [2-3 sentences explaining the user's legal rights in simple English]
NEXT_STEPS: [2-3 practical steps the user should take immediately]
URGENT: [YES or NO - is this an emergency requiring immediate help?]

User's problem:
{user_text}

Respond ONLY in the format above. No extra text.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful Indian legal assistant. Always respond in the exact format requested."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=500
    )

    raw = response.choices[0].message.content
    return parse_response(raw)


def parse_response(raw: str):
    """Parse the structured response from Groq"""
    result = {
        "category": "other",
        "stress_score": 5,
        "law_sections": [],
        "rights": "",
        "next_steps": "",
        "urgent": False
    }

    for line in raw.strip().split("\n"):
        if line.startswith("CATEGORY:"):
            result["category"] = line.replace("CATEGORY:", "").strip()
        elif line.startswith("STRESS_SCORE:"):
            try:
                result["stress_score"] = int(line.replace("STRESS_SCORE:", "").strip())
            except:
                result["stress_score"] = 5
        elif line.startswith("LAW_SECTIONS:"):
            sections = line.replace("LAW_SECTIONS:", "").strip()
            result["law_sections"] = [s.strip() for s in sections.split(",")]
        elif line.startswith("RIGHTS:"):
            result["rights"] = line.replace("RIGHTS:", "").strip()
        elif line.startswith("NEXT_STEPS:"):
            result["next_steps"] = line.replace("NEXT_STEPS:", "").strip()
        elif line.startswith("URGENT:"):
            result["urgent"] = line.replace("URGENT:", "").strip().upper() == "YES"

    return result


def get_helplines(category: str, urgent: bool):
    """Return relevant helpline numbers"""
    helplines = {
        "domestic violence": {
            "name": "National Domestic Violence Hotline",
            "number": "181",
            "available": "24/7"
        },
        "workplace harassment": {
            "name": "She-Box Portal",
            "number": "14441",
            "available": "9AM-6PM"
        },
        "child rights": {
            "name": "Childline India",
            "number": "1098",
            "available": "24/7"
        },
        "police complaint": {
            "name": "Police Emergency",
            "number": "100",
            "available": "24/7"
        }
    }

    # Always include these
    general = [
        {"name": "NALSA Legal Aid", "number": "15100", "available": "24/7"},
        {"name": "Mental Health Helpline (iCall)", "number": "9152987821", "available": "Mon-Sat 8AM-10PM"}
    ]

    specific = helplines.get(category, None)
    if specific:
        return [specific] + general
    return general