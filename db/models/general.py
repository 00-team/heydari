
from pydantic import BaseModel
from sqlalchemy import JSON, Column, Integer

from .common import BaseTable


class GeneralTable(BaseTable):
    __tablename__ = 'general'

    general_id = Column(Integer, primary_key=True)
    tags = Column(JSON, nullable=False, server_default='[]')


class GeneralModel(BaseModel):
    general_id: int
    tags: list[str]
