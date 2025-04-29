from pydantic import BaseModel
from typing import Dict
from google import genai
import os
import json

class Summarizer(BaseModel):
    topic: str
    summary: str

class Summarize:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API"))

    def generate_summary(self, story_data: Dict) -> Dict:
        """
        Generate a summary for the given story data.
        """
        try:
            # Extract relevant data from the story
            plot = story_data.get("plot", {})
            dialogue = story_data.get("dialogue", [])
            visuals = story_data.get("visuals", {})
            hooks = story_data.get("hooks", {})

            # Prepare the prompt for the summarization model
            prompt = f"""
            Summarize the following Marvel financial literacy story:
            - Title: {plot.get('title', 'N/A')}
            - Setup: {plot.get('setup', 'N/A')}
            - Location: {plot.get('location', 'N/A')}
            - Key Dialogue: {', '.join([d['text'] for d in dialogue])}
            - Visuals: {visuals.get('financial_elements', 'N/A')}
            - Pop Culture Reference: {hooks.get('pop_culture', 'N/A')}
            - Music Theme: {hooks.get('music', 'N/A')}

            Provide a concise summary in the following format:
            {{
                "topic": "Story Title",
                "summary": "A brief summary of the story."
            }}
            """

            # Generate the summary using the GenAI client
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt,
            )

            # Parse the response and validate it
            summary_data = json.loads(response.text)
            validated_summary = Summarizer(**summary_data)

            # Save the summary as a JSON file
            summary_file = f"output/summaries/{plot.get('title', 'summary').replace(' ', '_')}.json"
            os.makedirs(os.path.dirname(summary_file), exist_ok=True)
            with open(summary_file, "w") as f:
                json.dump(validated_summary.dict(), f, indent=4)

            return validated_summary.dict()

        except Exception as e:
            print(f"Error generating summary: {e}")
            raise e