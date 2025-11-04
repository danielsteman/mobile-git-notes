from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .db import get_db
from .models import OAuthToken, User
from .security import encrypt_value, issue_app_jwt, get_current_user
from .settings import settings


router = APIRouter(prefix="/auth/github", tags=["auth"])


class ExchangeRequest(BaseModel):
    code: str
    code_verifier: Optional[str] = None
    redirect_uri: Optional[str] = None


class ExchangeResponse(BaseModel):
    token: str
    user: dict


async def _exchange_code_for_token(payload: dict[str, Any]) -> dict[str, Any]:
    headers = {"Accept": "application/json"}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            headers=headers,
            data=payload,
        )
        resp.raise_for_status()
        return resp.json()


async def _fetch_github_user(access_token: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
            },
        )
        resp.raise_for_status()
        return resp.json()


@router.post("/exchange", response_model=ExchangeResponse)
async def exchange_code(
    body: ExchangeRequest,
    db: Session = Depends(get_db),
):
    payload = {
        "client_id": settings.github_client_id,
        "client_secret": settings.github_client_secret.get_secret_value(),
        "code": body.code,
    }
    if body.redirect_uri:
        payload["redirect_uri"] = body.redirect_uri
    if body.code_verifier:
        payload["code_verifier"] = body.code_verifier

    token_json = await _exchange_code_for_token(payload)
    access_token = token_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Code exchange failed")

    scope = token_json.get("scope")
    expires_in = token_json.get("expires_in")
    refresh_token = token_json.get("refresh_token")

    gh_user = await _fetch_github_user(access_token)

    github_id = int(gh_user["id"])  # guaranteed by GitHub
    login = gh_user.get("login")
    avatar_url = gh_user.get("avatar_url")

    # Upsert user
    user = db.query(User).filter(User.github_id == github_id).one_or_none()
    if user is None:
        user = User(github_id=github_id, login=login, avatar_url=avatar_url)
        db.add(user)
        db.flush()  # get user.id
    else:
        user.login = login
        user.avatar_url = avatar_url

    # Upsert token
    token_row = (
        db.query(OAuthToken)
        .filter(OAuthToken.user_id == user.id, OAuthToken.provider == "github")
        .one_or_none()
    )

    expires_at = None
    if expires_in:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=int(expires_in))

    enc_access = encrypt_value(access_token)
    enc_refresh = encrypt_value(refresh_token) if refresh_token else None

    if token_row is None:
        token_row = OAuthToken(
            user_id=user.id,
            provider="github",
            access_token_encrypted=enc_access,
            scope=scope,
            expires_at=expires_at,
            refresh_token_encrypted=enc_refresh,
        )
        db.add(token_row)
    else:
        token_row.access_token_encrypted = enc_access
        token_row.scope = scope
        token_row.expires_at = expires_at
        token_row.refresh_token_encrypted = enc_refresh

    db.commit()

    app_jwt = issue_app_jwt(user.id)
    return ExchangeResponse(
        token=app_jwt,
        user={"id": user.id, "login": user.login, "avatar_url": user.avatar_url},
    )


@router.get("/callback")
async def oauth_callback(
    code: str,
    return_to: Optional[str] = None,
    db: Session = Depends(get_db),
):
    # Web callback helper: exchange the code and return a simple message with the app JWT
    payload = {
        "client_id": settings.github_client_id,
        "client_secret": settings.github_client_secret.get_secret_value(),
        "code": code,
    }
    token_json = await _exchange_code_for_token(payload)
    access_token = token_json.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Code exchange failed")

    gh_user = await _fetch_github_user(access_token)
    github_id = int(gh_user["id"])
    login = gh_user.get("login")
    avatar_url = gh_user.get("avatar_url")

    # Upsert user
    user = db.query(User).filter(User.github_id == github_id).one_or_none()
    if user is None:
        user = User(github_id=github_id, login=login, avatar_url=avatar_url)
        db.add(user)
        db.flush()
    else:
        user.login = login
        user.avatar_url = avatar_url

    # Store token
    token_row = (
        db.query(OAuthToken)
        .filter(OAuthToken.user_id == user.id, OAuthToken.provider == "github")
        .one_or_none()
    )
    enc_access = encrypt_value(access_token)
    if token_row is None:
        token_row = OAuthToken(
            user_id=user.id,
            provider="github",
            access_token_encrypted=enc_access,
        )
        db.add(token_row)
    else:
        token_row.access_token_encrypted = enc_access
    db.commit()

    app_jwt = issue_app_jwt(user.id)

    # Prefer client-provided deep link (works in Expo Go using exp://),
    # otherwise fall back to the native scheme.
    if return_to:
        sep = "&" if "?" in return_to else "?"
        deep_link = f"{return_to}{sep}token={app_jwt}"
    else:
        deep_link = f"mobilegitnotes://oauth?token={app_jwt}"

    html = f"""
<!doctype html>
<html>
  <head><meta charset=\"utf-8\"><title>GitHub Login</title></head>
  <body>
    <p>Login successful. You can close this window.</p>
    <script>
      // Attempt to deep link back to the app if opened on device
      try {{ window.location = '{deep_link}'; }} catch (e) {{}}
    </script>
  </body>
</html>
"""
    return Response(content=html, media_type="text/html")


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "login": user.login, "avatar_url": user.avatar_url}
