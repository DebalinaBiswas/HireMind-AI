from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool

    # Database
    DATABASE_URL: str

    # Gemini
    GEMINI_API_KEY: str
    GEMINI_MODEL: str
    # Paths
    UPLOAD_DIR: str
    KNOWLEDGE_BASE_DIR: str

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()