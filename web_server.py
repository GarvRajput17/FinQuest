#!/usr/bin/env python3
"""
Pure backend server to serve the API for generating stories.
"""
import os, uuid
from typing import Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from Backend.GenAI.NovelGenerator import FinancialNovelGenerator

app = FastAPI(title="Financial Novel API")
story_cache: Dict[str, dict] = {}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the generator
generator = FinancialNovelGenerator()

class StoryRequest(BaseModel):
    difficulty: str = "beginner"
    concept: str = "emergency funds"
    choices: list = []
    entertainment: Dict = {
        "netflix_show": "Stranger Things",
        "spotify_track": "Anti-Hero By Taylor Swift"
    }
    characters: Dict = {
        "protagonist": "Spider-Man",
        "mentor": "Iron Man",
        "friend": "MJ"
    }

@app.post("/api/generate")
async def generate_story(request: StoryRequest):
    try:
        # Use the proper update_game_state method
        generator.update_game_state({
            "difficulty": request.difficulty,
            "selected_concept": request.concept,
            "entertainment_refs": request.entertainment,
            "characters": request.characters
        })
        print("Game state updated, generating story...")
        # Generate story
        story = generator.generate_story_segment()
        print("Story generated successfully")
        
        # Cache the story
        story_id = str(uuid.uuid4())
        story_cache[story_id] = story
        print(f"Story cached with ID: {story_id}")
        
        return {
            "success": True,
            "storyId": story_id,
            "story": story
        }
    except Exception as e:
        import traceback
        print("Full error traceback:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")



@app.get("/api/story/{story_id}")
async def get_story(story_id: str):
    if story_id in story_cache:
        return {"success": True, "story": story_cache[story_id]}
    raise HTTPException(status_code=404, detail="Story not found")

@app.get("/api/latest-story")
async def get_latest_story():
    if not story_cache:
        raise HTTPException(status_code=404, detail="No stories available")
    latest_id = list(story_cache.keys())[-1]
    return {"success": True, "story": story_cache[latest_id]}

def main():
    uvicorn.run(app, host="0.0.0.0", port=5000)

if __name__ == "__main__":
    main()
