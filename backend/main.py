from fastapi import FastAPI, Request
from schema import AskRequest
import ollama_client
import openai_client 
from db import run_sql_query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Liste des origines autorisées (ex: React en local)
origins = [
    "http://localhost:3000",  # React en mode dev
    "http://127.0.0.1:3000",  # Variante possible
]

# Ajout du middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # 🔐 Autorise uniquement ces origines
    allow_credentials=True,
    allow_methods=["*"],            # Autorise toutes les méthodes (GET, POST, etc.)
    allow_headers=["*"],            # Autorise tous les headers
)

@app.post("/ask")
def ask_question(req: AskRequest):
    question = req.messages[-1].content
    print("Question: ", question)
    if(req.provider == "openai"):
        query = openai_client.generate_sql_from_question(req.messages)
    else:
        query = ollama_client.generate_sql_from_question(req.messages)

    sql = query["sql"]
    lang = query["language"]
    if sql == "":
        return {
        "question": question,
        "sql_query": "",
        "result": "",
        "answer": "I'm sorry, I didn't understand your question. Could you please rephrase it?"
    }

    result = run_sql_query(sql)
    if(req.provider == "openai"):
        answer = openai_client.generate_answer_from_result(req.messages, sql, lang, result)
    else:
        answer = ollama_client.generate_answer_from_result(req.messages, sql, lang, result)

    return {
        "question": question,
        "sql_query": sql,
        "result": result,
        "answer": answer
    }
