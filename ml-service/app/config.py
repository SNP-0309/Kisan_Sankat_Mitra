from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    ENVIRONMENT: str = "development"
    SERVICE_API_KEY: str = "fasal_rakshak_ml_internal_secret_key_change_me"
    MODEL_PATH: str = "models/yolo_tomato_v1.pt"
    USE_MOCK_INFERENCE: bool = True
    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/webp"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
