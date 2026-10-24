from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Anthropic API key, required
    anthropic_api_key: str

    # Optional GitHub token for higher rate limits when fetching public repos
    github_token: str = ""

    # SQLite database file path (inside the container)
    database_url: str = "sqlite+aiosqlite:///./debug_assistant.db"

    # Claude model to use
    claude_model: str = "claude-sonnet-4-6"

    # Rate limiting, requests per IP address
    # Increase these if you want to be more permissive, lower them to be stricter.
    rate_limit_per_minute: int = 10
    rate_limit_per_day: int = 20

    class Config:
        # Look for .env in the backend folder first, then one level up (project root)
        env_file = (".env", "../.env")


# Create a single instance that the rest of the app imports
settings = Settings()
