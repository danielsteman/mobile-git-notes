import base64
import os
from typing import Generator

# Ensure required environment variables exist before importing the app modules
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
if "GITHUB_CLIENT_ID" not in os.environ:
    os.environ["GITHUB_CLIENT_ID"] = "test-client-id"
if "GITHUB_CLIENT_SECRET" not in os.environ:
    os.environ["GITHUB_CLIENT_SECRET"] = "test-client-secret"
if "JWT_SECRET" not in os.environ:
    os.environ["JWT_SECRET"] = "test-jwt-secret"
if "ENCRYPTION_KEY" not in os.environ:
    os.environ["ENCRYPTION_KEY"] = base64.b64encode(os.urandom(32)).decode("ascii")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.settings import settings


@pytest.fixture(scope="session", autouse=True)
def configure_settings() -> None:
    # Ensure required secrets are present for tests
    if not settings.encryption_key.get_secret_value():
        key = base64.b64encode(os.urandom(32)).decode("ascii")
        settings.encryption_key = type(settings.encryption_key)(key)
    if not settings.jwt_secret.get_secret_value():
        settings.jwt_secret = type(settings.jwt_secret)("test-secret")
    settings.jwt_issuer = "test-issuer"
    settings.github_client_id = settings.github_client_id or "test-client-id"
    if not settings.github_client_secret.get_secret_value():
        settings.github_client_secret = type(settings.github_client_secret)(
            "test-client-secret"
        )


@pytest.fixture(scope="session")
def test_engine():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(test_engine) -> Generator[Session, None, None]:
    TestingSessionLocal = sessionmaker(bind=test_engine, expire_on_commit=False)
    session: Session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    # Override the app dependency to use our in-memory DB session
    def _get_db_override():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_db_override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
