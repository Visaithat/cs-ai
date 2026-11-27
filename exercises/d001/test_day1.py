import pytest
from pydantic import ValidationError
from exercise_day1 import AIQueryRequest, parse_ai_request


def test_valid_defaults_and_stripping():
    req = parse_ai_request({"user_id": "USR-101", "query": "  ขอเช็ค status order ครับ  "})
    assert isinstance(req, AIQueryRequest)
    assert req.query == "ขอเช็ค status order ครับ"
    assert req.language == "th"
    assert req.top_k == 5
    assert req.temperature == pytest.approx(0.2)


def test_reject_whitespace_only_query():
    with pytest.raises(ValidationError):
        parse_ai_request({"user_id": "USR-101", "query": "     "})


def test_reject_invalid_user_id_prefix():
    with pytest.raises(ValidationError):
        parse_ai_request({"user_id": "ADMIN-1", "query": "สวัสดี"})


def test_reject_out_of_bounds_params():
    with pytest.raises(ValidationError):
        parse_ai_request({"user_id": "USR-101", "query": "สวัสดี", "top_k": 0})
    with pytest.raises(ValidationError):
        parse_ai_request({"user_id": "USR-101", "query": "สวัสดี", "temperature": 1.5})


def test_accept_mixed_language():
    req = parse_ai_request({
        "user_id": "USR-999",
        "query": "วิธี reset password",
        "language": "mixed",
        "top_k": 10,
        "temperature": 0.0,
    })
    assert req.language == "mixed"
    assert req.top_k == 10
