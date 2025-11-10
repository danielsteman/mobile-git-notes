from sqlalchemy.orm.session import Session


from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .settings import settings


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""

    pass


# Create the SQLAlchemy engine and SessionLocal using the configured URL.
# Neon requires SSL; enforce it via connect_args to avoid plaintext connections.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"},
)
SessionLocal = sessionmaker[Session](
    bind=engine, expire_on_commit=False, class_=Session
)


def get_db() -> Generator[Session, None, None]:
    """Yield a database session and ensure it is closed afterward."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
