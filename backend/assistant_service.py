import tiktoken
import json
import openai_client
import ollama_client
from schema import MessageRequest
from datetime import datetime


def generate_sql_from_question(messagesReq: list[MessageRequest], provider: str) -> str:
    messages = [
        {
            "role": "system",
            "content": (
                "You are an assistant that strictly converts user questions into SQL SELECT queries only. "
                "Never generate INSERT, UPDATE, DELETE, or any non-SELECT SQL. "
                "Respond with a valid JSON object with two fields: 'sql' (the SQL SELECT query) and 'language' (e.g., 'english', 'french') of the user input. "
                "Do not add explanations or extra text. "
                "Use the following database schema:\n\n"
                "Table 'product':\n"
                "- id: SERIAL PRIMARY KEY\n"
                "- name: VARCHAR(100) NOT NULL\n"
                "- description: TEXT\n"
                "- price: NUMERIC(10,2) NOT NULL\n"
                "- stock: INTEGER NOT NULL DEFAULT 0\n"
                "- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n\n"
                "Table 'customer':\n"
                "- id: SERIAL PRIMARY KEY\n"
                "- name: VARCHAR(100) NOT NULL\n"
                "- email: VARCHAR(100) UNIQUE NOT NULL\n"
                "- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n\n"
                "Table 'purchase':\n"
                "- id: SERIAL PRIMARY KEY\n"
                "- customer_id: INTEGER REFERENCES customer(id) ON DELETE CASCADE\n"
                "- product_id: INTEGER REFERENCES product(id) ON DELETE SET NULL\n"
                "- amount: NUMERIC(10,2) NOT NULL\n"
                "- quantity: INTEGER NOT NULL DEFAULT 1\n"
                "- status: VARCHAR(50) CHECK (status IN ('pending', 'completed', 'cancelled')) NOT NULL\n"
                "- purchased_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n"
                "- tracking_id: VARCHAR(100)\n\n"
                "If you cannot generate a SELECT query, respond with -1 only."
            )
        }
]
    for message in messagesReq:
        messages.append({"role": message.role, "content": message.content})
    
    start_date = datetime.now()
    content = fetch_from_client(messages, provider)
    end_date = datetime.now()


    if content == "-1":
        return {
            "duration": (end_date - start_date).total_seconds() * 1000,
            "tokens": count_tokens(messages),
            "sql": "",
            "language": ""
        }
    
    data = json.loads(content)
    return {
        "duration": (end_date - start_date).total_seconds() * 1000,
        "tokens": count_tokens(messages),
        "sql": data["sql"],
        "language": data["language"]
    }

def generate_answer_from_result(messagesReq: list[MessageRequest], sql_query: str,lang: str, result: str, provider: str) -> str:
    messages: list[MessageRequest] = [
        {"role": "system", "content": (
                "You are a helpful assistant that explains SQL results in plain language"
                "You must always keep it responses short and non-technical."
        )},
    ]
    for message in messagesReq:
        messages.append({"role": message.role, "content": message.content})
    messages.append({"role": "system", "content": f"from now on, always translate to {lang}."})
    messages.append({"role": "assistant", "content": sql_query})
    messages.append({"role": "user", "content": f"The result is: {result}"})
    
    start_date = datetime.now()
    content = fetch_from_client(messages, provider)
    end_date = datetime.now()

    return {
        "duration": (end_date - start_date).total_seconds() * 1000,
        "tokens": count_tokens(messages),
        "interpretation": content,
    }


def count_tokens(messages, model="gpt-3.5-turbo"):
    enc = tiktoken.encoding_for_model(model)
    total = 0
    for msg in messages:
        total += 4  # base tokens per message
        total += len(enc.encode(msg["role"]))
        total += len(enc.encode(msg["content"]))
    total += 2  # priming
    return total

def fetch_from_client(messages: list[MessageRequest], provider: str):
    if provider == "openai":
        return openai_client.fetch(messages)
    if provider == "ollama":
        return ollama_client.fetch(messages)
    