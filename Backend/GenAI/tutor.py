from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API")

class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[str]

class ChatHistory(BaseModel):
    messages: List[Message] = Field(default_factory=list)
    context: Optional[Dict] = None

class TutorResponse(BaseModel):
    answer: str
    sources: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)

class FinancialTutor:
    def __init__(self):
        self.client = genai.Client(api_key=API_KEY)
        self.model = "gemini-2.0-flash-lite"
        
        # Initialize all-MiniLM embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Configure text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        self.vector_store = None

    def load_knowledge_base(self, document_path: str):
        """Load and process the financial education document"""
        with open(document_path, 'r') as file:
            raw_text = file.read()
        
        # Split text into chunks
        texts = self.text_splitter.split_text(raw_text)
        
        # Create vector store
        self.vector_store = FAISS.from_texts(
            texts,
            self.embeddings
        )

    async def get_response(self, query: str, chat_history: ChatHistory) -> TutorResponse:
        """Generate personalized response using RAG"""
        if not self.vector_store:
            raise ValueError("Knowledge base not loaded")

        # Get relevant documents
        relevant_docs = self.vector_store.similarity_search(query, k=3)
        
        # Construct prompt with context
        context = "\n".join([doc.page_content for doc in relevant_docs])
        chat_context = "\n".join([f"{msg.role}: {msg.content}" for msg in chat_history.messages[-5:]])
        
        prompt = f"""
        Context from financial documents:
        {context}

        Previous conversation:
        {chat_context}

        User question: {query}

        Provide a helpful, accurate response based on the context and conversation history.
        """

        # Generate response using Gemini
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40
            }
        )

        # Calculate confidence based on source relevance
        confidence = min(len(relevant_docs) / 3, 1.0)

        return TutorResponse(
            answer=response.text,
            sources=[doc.metadata.get('source', 'Unknown') for doc in relevant_docs],
            confidence=confidence
        )

    def clear_history(self):
        """Clear conversation history"""
        self.memory.clear()
