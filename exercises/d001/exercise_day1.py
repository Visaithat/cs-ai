from typing import Literal
from pydantic import BaseModel, Field, field_validator


class AIQueryRequest(BaseModel):
    # TODO: กำหนด fields และ validation rules ตาม spec
    pass


def parse_ai_request(payload: dict) -> AIQueryRequest:
    # TODO: validate และ return AIQueryRequest
    raise NotImplementedError
