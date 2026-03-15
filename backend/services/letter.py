import os
from groq import Groq
from dotenv import load_dotenv
from datetime import date

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_complaint_letter(
    user_text: str,
    category: str,
    law_sections: list,
    user_name: str = "The Complainant",
    user_address: str = "Address of Complainant",
    authority: str = None
):
    """
    Generates a legally formatted complaint letter
    based on the user's problem
    """

    # Decide who to address based on category
    if authority is None:
        authority_map = {
            "domestic violence": "The Protection Officer\nDistrict Protection Office",
            "workplace harassment": "The Internal Complaints Committee\nWorkplace ICC",
            "wage theft": "The Labour Commissioner\nDistrict Labour Office",
            "police complaint": "The Station House Officer\nLocal Police Station",
            "consumer complaint": "The District Consumer Forum\nDistrict Consumer Court",
            "land dispute": "The District Collector\nDistrict Collectorate",
            "dowry harassment": "The Station House Officer\nLocal Police Station",
            "child rights": "The Child Welfare Committee\nDistrict CWC Office",
            "right to information": "The Public Information Officer",
            "other": "The Concerned Authority"
        }
        authority = authority_map.get(category, "The Concerned Authority")

    today = date.today().strftime("%d %B %Y")
    sections_text = ", ".join(law_sections) if law_sections else "relevant sections"

    prompt = f"""
Generate a formal legal complaint letter in India with this EXACT structure:

Date: {today}

To,
{authority}

Subject: Complaint regarding {category}

Respected Sir/Madam,

[3-4 paragraphs describing the complaint based on this situation: {user_text}]

[Mention these law sections: {sections_text}]

[Request for immediate action]

Yours faithfully,
{user_name}
{user_address}
Date: {today}

Rules:
- Use formal, legal English
- Be specific about the complaint
- Mention the law sections naturally
- Keep it professional and factual
- Maximum 300 words
- Do NOT add any extra commentary outside the letter
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a legal document writer in India. Generate formal complaint letters only. No extra text outside the letter."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=600
    )

    return response.choices[0].message.content