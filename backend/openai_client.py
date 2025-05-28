from openai import OpenAI
from schema import MessageRequest
import vars

client = OpenAI(api_key=vars.openai_api_key)
MODEL = "gpt-3.5-turbo"

def fetch(messages: list[MessageRequest]):
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.3,  # Lower temperature = more deterministic
        max_tokens=500
    )
    content = response.choices[0].message.content
    
    return content
