from pathlib import Path

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


REPO_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = REPO_ROOT / ".env"


class Settings(BaseSettings):
    database_url: str
    github_client_id: str
    github_client_secret: SecretStr
    encryption_key: SecretStr  # base64-encoded 32 bytes
    jwt_secret: SecretStr
    jwt_issuer: str = "mobile-git-notes-api"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
