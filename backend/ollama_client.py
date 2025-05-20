import httpx
from schema import MessageRequest

OLLAMA_URL = "http://localhost:11434/api/chat"

OLLAMA_MODEL = "llama3"

def fetch(messages: list[MessageRequest]):
    response = httpx.post(OLLAMA_URL, json={"model": OLLAMA_MODEL, "stream": False, "messages": messages}, timeout=560.0 )
    return response.json()["message"]["content"]
