from app.security import encrypt_value, decrypt_value, issue_app_jwt, verify_app_jwt


def test_encrypt_decrypt_roundtrip():
    plaintext = "super-secret-token"
    enc = encrypt_value(plaintext)
    assert enc != plaintext
    dec = decrypt_value(enc)
    assert dec == plaintext


def test_issue_and_verify_jwt():
    token = issue_app_jwt(user_id=123, expires_in_minutes=10)
    payload = verify_app_jwt(token)
    assert payload["sub"] == "123"
