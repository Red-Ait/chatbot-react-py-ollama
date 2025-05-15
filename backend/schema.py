from pydantic import BaseModel


class MessageRequest(BaseModel):
    role: str
    content: str

class AskRequest(BaseModel):
    messages: list[MessageRequest]
    provider: str

