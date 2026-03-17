import os
import groq
from dotenv import load_dotenv

load_dotenv()

client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))

def transcribe_audio(audio_file, language: str = None):
    """
    Transcribe audio using Groq's Whisper API
    Supports Hindi (hi), Kannada (kn), English (en)
    """
    try:
        transcription_params = {
            "file": audio_file,
            "model": "whisper-large-v3",
            "response_format": "text",
        }
        
        # Add language hint if provided
        if language and language != "auto":
            transcription_params["language"] = language

        transcription = client.audio.transcriptions.create(
            **transcription_params
        )
        
        return {
            "success": True,
            "text": transcription,
            "language": language or "auto-detected"
        }
        
    except Exception as e:
        print(f"Transcription error: {e}")
        return {
            "success": False,
            "text": "",
            "error": str(e)
        }