from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

def get_db():
    client = MongoClient(os.getenv("MONGODB_URL"))
    db = client["nyaya_ai"]
    return db

def save_case(
    problem_text: str,
    category: str,
    stress_score: int,
    law_sections: list,
    rights: str,
    next_steps: str,
    urgent: bool,
    user_name: str = "Anonymous",
    city: str = "Unknown"
):
    try:
        db = get_db()
        cases_collection = db["cases"]
        case = {
            "problem_text": problem_text,
            "category": category,
            "stress_score": stress_score,
            "law_sections": law_sections,
            "rights": rights,
            "next_steps": next_steps,
            "urgent": urgent,
            "user_name": user_name,
            "city": city,
            "timestamp": datetime.now(),
            "date": datetime.now().strftime("%d %B %Y %I:%M %p")
        }
        result = cases_collection.insert_one(case)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Save error: {e}")
        return None

def get_all_cases():
    try:
        db = get_db()
        cases_collection = db["cases"]
        cases = list(cases_collection.find().sort("timestamp", -1))
        for case in cases:
            case["_id"] = str(case["_id"])
        return cases
    except Exception as e:
        print(f"Get error: {e}")
        return []

def get_cases_by_category(category: str):
    try:
        db = get_db()
        cases_collection = db["cases"]
        cases = list(cases_collection.find({"category": category}).sort("timestamp", -1))
        for case in cases:
            case["_id"] = str(case["_id"])
        return cases
    except Exception as e:
        print(f"Get error: {e}")
        return []

def get_stats():
    try:
        db = get_db()
        cases_collection = db["cases"]
        total = cases_collection.count_documents({})
        urgent = cases_collection.count_documents({"urgent": True})
        high_stress = cases_collection.count_documents({"stress_score": {"$gte": 7}})
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        top_categories = list(cases_collection.aggregate(pipeline))
        return {
            "total_cases": total,
            "urgent_cases": urgent,
            "high_stress_cases": high_stress,
            "top_categories": top_categories
        }
    except Exception as e:
        print(f"Stats error: {e}")
        return {
            "total_cases": 0,
            "urgent_cases": 0,
            "high_stress_cases": 0,
            "top_categories": []
        }
