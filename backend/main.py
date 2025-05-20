from fastapi import FastAPI, Request
from schema import AskRequest
import assitant_service
import db
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

    user_input=req.messages[-1].content
    provider=req.provider

    try:
        query = assitant_service.generate_sql_from_question(req.messages, provider)
    except Exception as e:
        db.insert_metrics(
            user_input = user_input,
            provider = provider,
            generated_sql_status = "failure",
            exception_msg=str(e)
        )
        return {
            "question": user_input,
            "sql_query": "",
            "result": "",
            "answer": "Sorry, I couldn't understand your question. Please rephrase it."
        }

    generated_sql = query["sql"]
    language = query["language"]
    generate_sql_request_tokens = query["tokens"],
    generated_sql_duration_ms = query["duration"],

    if generated_sql == "":
        db.insert_metrics(
            user_input = user_input,
            provider = provider,
            generated_sql = generated_sql,
            generated_sql_duration_ms = generated_sql_duration_ms,
            generate_sql_request_tokens = generate_sql_request_tokens,
            generated_sql_status = "failure",
            language=language
        )
        return {
            "question": user_input,
            "sql_query": "",
            "result": "",
            "answer": "I'm sorry, I didn't understand your question. Could you please rephrase it?"
        }

    sql_result = db.run_sql_query(generated_sql)

    try:
        generated_answer = assitant_service.generate_answer_from_result(req.messages, generated_sql, language, sql_result, provider)
    except Exception as e:
        db.insert_metrics(
            user_input = user_input,
            generate_sql_request_tokens = generate_sql_request_tokens,
            provider = provider,
            generated_sql = generated_sql,
            generated_sql_duration_ms = generated_sql_duration_ms,
            generated_sql_status = "success",
            sql_result = sql_result,
            generated_interpretation_status = "failure",
            language = language,
            exception_msg=str(e)
        )
        return {
            "question": user_input,
            "sql_query": "",
            "result": "",
            "answer": "I'm sorry, I didn't understand your question. Could you please rephrase it?"
        }
    

    generated_interpretation = generated_answer["interpretation"]
    generate_interpretation_request_tokens=generated_answer["tokens"],
    generated_interpretation_duration_ms=generated_answer["duration"],

    db.insert_metrics(
        user_input = user_input,
        generate_sql_request_tokens = generate_sql_request_tokens,
        provider = provider,
        generated_sql = generated_sql,
        generated_sql_duration_ms = generated_sql_duration_ms,
        generated_sql_status = "success",
        sql_result = sql_result,
        generate_interpretation_request_tokens = generate_interpretation_request_tokens,
        generated_interpretation = generated_interpretation,
        generated_interpretation_duration_ms = generated_interpretation_duration_ms,
        generated_interpretation_status = "success",
        language = language
    )

    return {
        "question": user_input,
        "sql_query": generated_sql,
        "result": sql_result,
        "answer": generated_interpretation
    }


@app.get("/metrics")
def get_metrics():
    return db.get_metrics()