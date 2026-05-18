from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL              : str = "postgresql+asyncpg://fintrack:secret@localhost:5432/fintrack"
    JWT_SECRET_KEY            : str = "changeme"
    ALGORITHM                 : str = "HS256"
    ACCESS_TOKEN_EXP_MINUTES  : int = 15
    REFRESH_TOKEN_EXP_MINUTES : int = 10080  # 7 hari
    FIELD_ENC_KEY             : str = "0" * 64
    ENVIRONMENT               : str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
