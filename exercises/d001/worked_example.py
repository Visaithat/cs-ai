from typing import Literal
from pydantic import BaseModel, Field, ValidationError, field_validator


class TicketClassification(BaseModel):
    ticket_id: str = Field(min_length=4, description="รหัสทิกเก็ต เช่น TKT-001")
    category: Literal["billing", "technical", "general"]
    confidence: float = Field(ge=0.0, le=1.0)
    summary_th: str = Field(min_length=5, max_length=200)

    @field_validator("summary_th")
    @classmethod
    def strip_and_check_non_empty(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 5:
            raise ValueError("summary_th ต้องมีความยาวอย่างน้อย 5 ตัวอักษรหลังตัดช่องว่าง")
        return cleaned


# 1) Valid payload (สังเกตว่า confidence เป็น string "0.92" — Pydantic แปลงเป็น float ให้อัตโนมัติ)
valid_raw = {
    "ticket_id": "TKT-2026",
    "category": "billing",
    "confidence": "0.92",
    "summary_th": "  ลูกค้าสอบถามใบกำกับภาษีซ้ำซ้อน  ",
}
result = TicketClassification.model_validate(valid_raw)
print("VALID:", result.model_dump_json())

# 2) Invalid payload (category ผิด + confidence เกิน 1.0)
invalid_raw = {
    "ticket_id": "TKT-2026",
    "category": "refund",
    "confidence": 1.4,
    "summary_th": "   ",
}
try:
    TicketClassification.model_validate(invalid_raw)
except ValidationError as err:
    print(f"INVALID ({err.error_count()} errors):")
    for e in err.errors():
        print(" -", e["loc"], "->", e["msg"])
