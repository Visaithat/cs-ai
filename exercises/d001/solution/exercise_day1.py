from typing import Literal

from pydantic import BaseModel, Field, field_validator


class AIQueryRequest(BaseModel):
    user_id: str = Field(min_length=6)
    query: str
    language: Literal["th", "en", "mixed"] = "th"
    top_k: int = Field(default=5, ge=1, le=20)
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        if not v.startswith("USR-"):
            raise ValueError("user_id must start with 'USR-'")
        return v

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        cleaned = v.strip()
        if not (3 <= len(cleaned) <= 500):
            raise ValueError("query length must be between 3 and 500")
        return cleaned


def parse_ai_request(payload: dict) -> AIQueryRequest:
    return AIQueryRequest.model_validate(payload)
