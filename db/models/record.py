
from enum import Enum
from functools import cached_property
from hashlib import sha3_256
from pathlib import Path

from pydantic import BaseModel
from sqlalchemy import BLOB, Column, Integer, String, text

from shared import settings

from .common import BaseTable


class RecordTable(BaseTable):
    __tablename__ = 'records'

    record_id = Column(
        Integer, primary_key=True,
        index=True, autoincrement=True
    )
    salt = Column(BLOB, nullable=False)
    owner = Column(
        Integer, nullable=False,
        index=True, server_default=text('-1')
    )
    size = Column(Integer, nullable=False, server_default=text('0'))
    mime = Column(String, nullable=False, server_default='unknown')
    ext = Column(String, nullable=False)
    item = Column(Integer, index=True)
    item_table = Column(Integer, server_default=text('0'))
    timestamp = Column(Integer, nullable=False, server_default=text('0'))


class RecordItemTable(int, Enum):
    LOST = 0
    BLOG = 1


class RecordModel(BaseModel):
    record_id: int
    salt: bytes
    owner: int
    size: int
    mime: str
    ext: str
    timestamp: int
    item: int | None = None
    item_table: RecordItemTable

    @cached_property
    def name(self) -> str:
        return sha3_256(
            self.record_id.to_bytes(12, byteorder='little') + self.salt
        ).hexdigest()

    @cached_property
    def path(self) -> Path:
        return settings.record_dir / (self.name + '.' + self.ext)
