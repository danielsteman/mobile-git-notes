import base64
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .security import get_current_user, get_github_token_for_user


router = APIRouter(prefix="/github", tags=["github"])


class CreateRepoRequest(BaseModel):
    name: str
    private: bool = False
    description: Optional[str] = None


@router.post("/repos")
async def create_repo(
    body: CreateRepoRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = get_github_token_for_user(user.id, db)
    if not token:
        raise HTTPException(status_code=400, detail="No GitHub token on file")
    data = {"name": body.name, "private": body.private}
    if body.description is not None:
        data["description"] = body.description

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            "https://api.github.com/user/repos",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
            json=data,
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


@router.get("/repos")
async def list_repos(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    per_page: int = 30,
    page: int = 1,
):
    token = get_github_token_for_user(user.id, db)
    if not token:
        raise HTTPException(status_code=400, detail="No GitHub token on file")

    params = {"per_page": per_page, "page": page}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(
            "https://api.github.com/user/repos",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
            params=params,
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


class PutFileRequest(BaseModel):
    message: str
    contentBase64: str
    branch: Optional[str] = None
    sha: Optional[str] = None  # required if updating existing file


@router.put("/repos/{owner}/{repo}/contents/{path:path}")
async def put_file(
    owner: str,
    repo: str,
    path: str,
    body: PutFileRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = get_github_token_for_user(user.id, db)
    if not token:
        raise HTTPException(status_code=400, detail="No GitHub token on file")

    # Validate content is valid base64
    try:
        base64.b64decode(body.contentBase64, validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="contentBase64 is not valid base64")

    payload = {"message": body.message, "content": body.contentBase64}
    if body.branch:
        payload["branch"] = body.branch
    if body.sha:
        payload["sha"] = body.sha

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.put(
            f"https://api.github.com/repos/{owner}/{repo}/contents/{path}",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
            json=payload,
        )
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()
