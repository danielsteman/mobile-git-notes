from fastapi import FastAPI

from .db import Base, engine
from .auth import router as auth_router
from .github import router as github_router

app = FastAPI()


@app.on_event("startup")
def on_startup() -> None:
    # Create DB tables if they do not exist
    Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(github_router)
