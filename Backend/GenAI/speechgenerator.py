import requests
import base64
import os
from fastapi import FastAPI, WebSocket
from web_server import app

class TTSGenerator:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
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

