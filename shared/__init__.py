

from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    base_dir: Path = Path(__file__).parent.parent
    debug: bool = False


settings = Settings(_env_file='.secrets')
