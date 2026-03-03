from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 8001
    cors_origins: list[str] = ["http://localhost:3020"]
    scrape_timeout: int = 10
    overall_timeout: int = 30
    max_workers: int = 3
    max_content_length: int = 3000


settings = Settings()
