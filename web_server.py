#!/usr/bin/env python3
import os, uuid
from typing import Dict, Optional
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn, traceback
from pydantic import BaseModel
from Backend.GenAI.NovelGenerator import FinancialNovelGenerator
from Backend.GenAI.QuizGenerator import QuizGenerator
from Backend.GenAI.Summarizer import Summarize
import base64, requests

app = FastAPI(title="Financial Novel API")
story_cache: Dict[str, dict] = {}
quiz_cache: Dict[str, dict] = {}
summary_cache : Dict[str, dict] = {}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the generators
generator = FinancialNovelGenerator()
quiz_generator = QuizGenerator()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

class TTSGenerator:
    def __init__(self):
        self.api_key = ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.voices = {
            "Spider-Man": "pNInz6obpgDQGcFmaJgB",  # Young male voice
            "Iron Man": "VR6AewLTigWG4xSOukaG",    # Mature male voice
            "MJ": "EXAVITQu4vr4xnSDxMaL"          # Female voice
        }

    async def generate_speech(self, text: str, character: str) -> str:
        voice_id = self.voices.get(character, self.voices["Spider-Man"])
        
        response = requests.post(
            f"{self.base_url}/text-to-speech/{voice_id}",
            headers={"xi-api-key": self.api_key},
            json={
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
        )
        
        if response.status_code == 200:
            return base64.b64encode(response.content).decode()
        return None

# Initialize TTS
tts_generator = TTSGenerator()

class StoryRequest(BaseModel):
    pass

@app.post("/api/generate")
async def generate_story(request: StoryRequest):
    try:
        print("Loading user preferences...")
        generator.load_user_data()  # Explicitly call load_user_data first
        
        print("Generating story from user preferences...")
        story = generator.generate_story_segment()
        print("Story generated successfully")
        
        # Generate quiz
        quiz = quiz_generator.generate_quiz(story.model_dump(), generator.game_state.difficulty)
        print("Quiz generated successfully")
        
        # Cache the story and quiz
        story_id = str(uuid.uuid4())
        story_cache[story_id] = story.model_dump()
        quiz_cache[story_id] = quiz.model_dump()
        
        print(f"Story cached with ID: {story_id}")
        print(f"Quiz cached with ID: {story_id}")
        
        return {
            "success": True,
            "storyId": story_id,
            "story": story.model_dump(),
            "quiz": quiz.model_dump()
        }
    except Exception as e:
        print("Full error traceback:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")

@app.websocket("/tts")
async def tts_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        try:
            data = await websocket.receive_json()
            audio_b64 = await tts_generator.generate_speech(
                text=data["text"],
                character=data["character"]
            )
            await websocket.send_json({"audio": audio_b64})
        except Exception as e:
            await websocket.send_json({"error": str(e)})
            break

@app.get("/api/story/{story_id}")
async def get_story(story_id: str):
    if story_id in story_cache:
        return {
            "success": True, 
            "story": story_cache[story_id],
            "quiz": quiz_cache.get(story_id),
            "summary": summary_cache.get(story_id)
        }
    raise HTTPException(status_code=404, detail="Story not found")

@app.get("/api/latest-story")
async def get_latest_story():
    if not story_cache:
        raise HTTPException(status_code=404, detail="No stories available")
    latest_id = list(story_cache.keys())[-1]
    return {
        "success": True, 
        "story": story_cache[latest_id],
        "quiz": quiz_cache.get(latest_id),
        "summary": summary_cache.get(latest_id)
    }

def main():
    uvicorn.run(app, host="0.0.0.0", port=5000)

if __name__ == "__main__":
    main()
