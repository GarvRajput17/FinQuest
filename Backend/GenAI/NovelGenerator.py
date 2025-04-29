import os
import json
import io
import datetime, traceback
import mimetypes
import random
from PIL import Image
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import cloudinary
import cloudinary.uploader

# Load environment variables and configure APIs
load_dotenv()
API_KEY = os.getenv("GEMINI_API")

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Pydantic Models
class Character(BaseModel):
    name: str
    description: str

class Background(BaseModel):
    name: str
    description: str

class Dialogue(BaseModel):
    character: str
    text: str
    hint: Optional[str] = None

class Plot(BaseModel):
    title: str
    setup: str
    location: str

class Visuals(BaseModel):
    characters: List[Character]
    backgrounds: List[Background]
    financial_elements: str

class Hooks(BaseModel):
    pop_culture: str
    music: str

class StoryData(BaseModel):
    plot: Plot
    dialogue: List[Dialogue]
    visuals: Visuals
    hooks: Hooks
    generated_images: Optional[Dict] = Field(default_factory=dict)

class GameState(BaseModel):
    difficulty: str = "beginner"
    selected_concept: str = "emergency funds"
    entertainment_refs: Dict[str, str] = {
        "netflix_show": "Stranger Things",
        "spotify_track": "Anti-Hero By Taylor Swift"
    }
    characters: Dict[str, str] = {
        "protagonist": "Spider-Man",
        "mentor": "Iron Man",
        "friend": "MJ"
    }

class FinancialNovelGenerator:
    def __init__(self):
        self.game_state = GameState()
        self.client = genai.Client(api_key=API_KEY)
        self.create_asset_directories()

    def create_asset_directories(self):
        dirs = [
            os.path.join("output", "stories"),
            os.path.join("output", "images", "characters"),
            os.path.join("output", "images", "backgrounds"),
            os.path.join("output", "temp")
        ]
        
        for directory in dirs:
            os.makedirs(directory, exist_ok=True)

    def upload_to_cloudinary(self, image: Image, folder: str, public_id: str) -> str:
        # Sanitize public_id: remove spaces, special chars, convert to lowercase
        sanitized_id = public_id.lower().replace(' ', '_').replace('&', 'and')
        sanitized_id = ''.join(c for c in sanitized_id if c.isalnum() or c == '_')
        
        temp_path = f"temp_{sanitized_id}.png"
        image.save(temp_path)
        
        result = cloudinary.uploader.upload(
            temp_path,
            folder=f"financial_novel/{folder}",
            public_id=sanitized_id,
            overwrite=True
        )
        
        os.remove(temp_path)
        return result['secure_url']


    def generate_story_segment(self) -> StoryData:
        prompt_template = f"""
        Generate a Marvel financial literacy story segment as JSON with these parameters:
        - Difficulty: {self.game_state.difficulty}
        - Concept: {self.game_state.selected_concept}
        - Characters: {self.game_state.characters}
        
        Follow this structure exactly and return valid JSON:
        {{
            "plot": {{
                "title": "Web of Finance",
                "setup": "{self.game_state.characters['protagonist']} needs to {{financial_goal}}",
                "location": "Marvel NYC location with financial elements"
            }},
            "dialogue": [
                {{
                    "character": "{self.game_state.characters['mentor']}",
                    "text": "Financial advice using tech analogy",
                    "hint": "Explain {self.game_state.selected_concept}"
                }}
            ],
            "visuals": {{
                "characters": [
                    {{
                        "name": "{self.game_state.characters['protagonist']}",
                        "description": "Detailed description for visualization"
                    }}
                ],
                "backgrounds": [
                    {{
                        "name": "Main location",
                        "description": "Detailed description of scene"
                    }}
                ],
                "financial_elements": "Creative visualization of {self.game_state.selected_concept}"
            }},
            "hooks": {{
                "pop_culture": "{self.game_state.entertainment_refs['netflix_show']} reference",
                "music": "{self.game_state.entertainment_refs['spotify_track']} theme"
            }}
        }}
        """

        try:
            response = self.client.models.generate_content(
                model='gemini-2.0-flash-lite',
                contents=prompt_template,
            )
            
            story_data = self._parse_response(response.text)
            validated_story = StoryData(**story_data)
            
            # Generate timestamp for unique IDs
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Generate and upload images
            self.generate_all_images_for_story(validated_story, timestamp)
            
            return validated_story
            
        except Exception as e:
            print(f"Error generating story: {e}")
            import traceback
            traceback.print_exc()
            return StoryData(
                plot=Plot(title="Error", setup="Error generating story", location="Error"),
                dialogue=[],
                visuals=Visuals(characters=[], backgrounds=[], financial_elements=""),
                hooks=Hooks(pop_culture="", music="")
            )

        
    def save_frontend_story(self, story_data: StoryData, story_id: str) -> str:
        """Save the frontend-formatted story JSON"""
        frontend_stories_dir = os.path.join("output", "frontend_stories")
        os.makedirs(frontend_stories_dir, exist_ok=True)
        
        frontend_story = self.format_story_for_frontend(story_data)
        frontend_filename = f"frontend_story_{story_id}.json"
        filepath = os.path.join(frontend_stories_dir, frontend_filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(frontend_story, f, indent=2)
        
        return filepath

    def generate_all_images_for_story(self, story_data: StoryData, timestamp: str) -> Dict:
        """Generate and upload all story images to Cloudinary"""
        image_paths = {
            "characters": {},
            "backgrounds": {},
        }
        
        # Generate and upload cover image
        cover_image = self.generate_story_cover(story_data)
        if cover_image:
            cover_id = f"cover_{timestamp}"
            cover_url = self.upload_to_cloudinary(cover_image, "covers", cover_id)
            image_paths["cover"] = cover_url
        
        # Generate and upload character images
        for character in story_data.visuals.characters[:5]:
            print(f"Generating image for character: {character.name}")
            character_image = self.generate_character_image(character.name, character.description)
            if character_image:
                char_id = f"{character.name.lower().replace(' ', '_')}_{timestamp}"
                char_url = self.upload_to_cloudinary(character_image, "characters", char_id)
                image_paths["characters"][character.name] = char_url
        
        # Generate and upload background images
        for bg in story_data.visuals.backgrounds[:5]:
            print(f"Generating background: {bg.name}")
            bg_image = self.generate_background_image(bg.name, bg.description)
            if bg_image:
                bg_id = f"{bg.name.lower().replace(' ', '_')}_{timestamp}"
                bg_url = self.upload_to_cloudinary(bg_image, "backgrounds", bg_id)
                image_paths["backgrounds"][bg.name] = bg_url
        
        # Update story data with image paths
        story_data.generated_images = image_paths
        return image_paths

    def generate_character_image(self, character_name: str, character_description: str) -> Optional[Image.Image]:
        """Generate a character image using Gemini"""
        prompt = f"""
        Create a Marvel comic-style portrait of {character_name} with these specifications:
        - Character: {character_name}
        - Description: {character_description}
        - Style: Vibrant Marvel comic book art style with bold outlines
        - Dont Create text bubbles, there should be no text bubble, we only need the character here.
        - Pose: Heroic, dynamic pose showing character's personality
        - Background: Simple, gradient background that highlights the character
        - Financial theme: Subtle elements related to {self.game_state.selected_concept} in the design
        """
        return self._generate_image(prompt, f"character_{character_name}")

    def generate_background_image(self, bg_name: str, bg_description: str) -> Optional[Image.Image]:
        """Generate a background image using Gemini"""
        prompt = f"""
        Create a Marvel comic-style background scene with these specifications:
        - Scene name: {bg_name}
        - Description: {bg_description}
        - Style: Vibrant Marvel comic book art style with detailed environment
        - Financial elements: Subtle integration of {self.game_state.selected_concept} concepts
        - Mood: Appropriate for a financial education story
       
        """
        return self._generate_image(prompt, f"background_{bg_name}")

    def _generate_image(self, prompt: str, image_type: str) -> Optional[Image.Image]:
        """Core image generation function"""
        print(f"Generating {image_type}")

        if image_type == "story_cover":
            prompt = f"""
            Create a Marvel comic-style cover image with these specifications:
            - Style: Dynamic comic book cover art with bold colors
            - Scene: {self.game_state.characters['protagonist']} and {self.game_state.characters['mentor']} discussing finances
            - Elements: Include financial symbols integrated naturally
            - Theme: {self.game_state.selected_concept}
            - Mood: Educational but exciting
            """

        try:
            model = "gemini-2.0-flash-exp-image-generation"
            contents = [
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt)],
                ),
            ]
            generate_content_config = types.GenerateContentConfig(
                temperature=1,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
                response_modalities=["image", "text"],
            )

            for chunk in self.client.models.generate_content_stream(
                model=model,
                contents=contents,
                config=generate_content_config,
            ):
                if not chunk.candidates or not chunk.candidates[0].content or not chunk.candidates[0].content.parts:
                    continue

                if chunk.candidates[0].content.parts[0].inline_data:
                    inline_data = chunk.candidates[0].content.parts[0].inline_data
                    file_extension = mimetypes.guess_extension(inline_data.mime_type)
                    temp_image = Image.open(io.BytesIO(inline_data.data))
                    return temp_image

            return None

        except Exception as e:
            print(f"Error generating {image_type} image: {e}")
            traceback.print_exc()
            return None

    def generate_story_cover(self, story_data: StoryData) -> Optional[Image.Image]:
        """Generate a cover image for the story"""
        prompt = f"""
        Create a Marvel comic-style cover illustration with these specifications:
        - Style: Bold, dynamic comic book cover art with vibrant colors
        - Main Focus: {story_data.plot.title}
        - Characters: {story_data.visuals.characters[0].name} in dynamic pose
        - Setting: {story_data.plot.location}
        - Financial Theme: Clear visual representation of {self.game_state.selected_concept}
        """
        return self._generate_image(prompt, "story_cover")

    def _parse_response(self, response_text: str) -> dict:
        """Parse and validate the JSON response"""
        try:
            # Direct JSON parsing
            data = json.loads(response_text)
            return StoryData(**data).dict()
        except json.JSONDecodeError:
            # Clean markdown and try again
            cleaned = response_text.replace('```json', '').replace('```', '').strip()
            try:
                data = json.loads(cleaned)
                return StoryData(**data).dict()
            except:
                # Extract JSON between braces
                start_idx = cleaned.find('{')
                end_idx = cleaned.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_content = cleaned[start_idx:end_idx]
                    data = json.loads(json_content)
                    return StoryData(**data).dict()
                
                # Return default structure
                return StoryData(
                    plot=Plot(title="Parsing Error", setup="Error in story generation", location="Error"),
                    dialogue=[],
                    visuals=Visuals(characters=[], backgrounds=[], financial_elements=""),
                    hooks=Hooks(pop_culture="", music="")
                ).dict()

    def save_to_json(self, data: StoryData, filename: str) -> str:
        """Save story data to JSON"""
        output_dir = os.path.join("output", "stories")
        os.makedirs(output_dir, exist_ok=True)
        
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data.dict(), f, indent=2)
        
        return filepath

    def get_story_with_images(self, story_id: Optional[str] = None) -> Dict:
        """Get story with Cloudinary images and frontend format"""
        story_data = self._load_story(story_id)
        
        if isinstance(story_data, StoryData):
            return {
                "story": story_data.dict(),
                "frontend_format": self.format_story_for_frontend(story_data)
            }
        return {"error": "Story not found"}

    def update_game_state(self, new_state: Dict) -> GameState:
        """Update game state with new values"""
        updated_state = self.game_state.copy(update=new_state)
        self.game_state = updated_state
        return self.game_state

    def list_available_stories(self) -> Dict:
        """List all available stories with their metadata"""
        stories_dir = os.path.join("output", "stories")
        if not os.path.exists(stories_dir):
            return {"error": "No stories directory found"}

        json_files = [f for f in os.listdir(stories_dir) if f.endswith('.json')]
        if not json_files:
            return {"error": "No stories found"}

        json_files.sort(reverse=True)
        stories = []
        
        for file in json_files:
            try:
                with open(os.path.join(stories_dir, file), 'r') as f:
                    story_data = StoryData(**json.load(f))
                    
                stories.append({
                    "story_id": file.replace(".json", ""),
                    "title": story_data.plot.title,
                    "concept": self.game_state.selected_concept,
                    "timestamp": file.split("_")[-1].replace(".json", "")
                })
            except Exception as e:
                print(f"Error loading story {file}: {e}")
        
        return {"stories": stories}

    def format_story_for_frontend(self, story_data: StoryData) -> Dict:
        """Transform story data into frontend-friendly format"""
        formatted_story = {
            "plot": story_data.plot.dict(),
            "dialogue_scenes": []
        }
        
        backgrounds = story_data.generated_images.get("backgrounds", {})
        character_images = story_data.generated_images.get("characters", {})
        
        for i, dialogue in enumerate(story_data.dialogue):
            bg_keys = list(backgrounds.keys())
            background_image = None
            
            if bg_keys:
                bg_index = min(i // (len(story_data.dialogue) // 2 + 1), len(bg_keys) - 1)
                background_image = backgrounds[bg_keys[bg_index]]
                
            character_image = character_images.get(dialogue.character)
            
            scene = {
                "dialogue": dialogue.dict(),
                "background_image": background_image,
                "character_image": character_image
            }
            
            formatted_story["dialogue_scenes"].append(scene)
        
        return formatted_story
