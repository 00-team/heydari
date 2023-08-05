

from pydantic import BaseModel
from sqlalchemy import TEXT, Column, ForeignKey, Integer, String, text

from db.models import RecordTable

from .common import BaseTable


class BlogTable(BaseTable):
    __tablename__ = 'blogs'

    blog_id = Column(
        Integer, primary_key=True,
        index=True, autoincrement=True
    )
    slug = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    content = Column(TEXT, nullable=False)
    author = Column(
        Integer, nullable=False,
        index=True, server_default=text('-1')
    )
    timestamp = Column(Integer, nullable=False, server_default=text('0'))
    thumbnail = Column(
        Integer,
        ForeignKey(RecordTable.record_id, ondelete='SET NULL')
    )


class BlogTagTable(BaseModel):
    __tablename__ = 'blog_tag'

    blog = Column(
        Integer,
        ForeignKey(BlogTable.blog_id, ondelete='CASCADE'),
        nullable=False
    )
    tag = Column(String, nullable=False)


class BlogModel(BaseModel):
    blog_id: int
    slug: str
    title: str
    description: str | None = None
    content: str
    author: int
    timestamp: int
    thumbnail: int | None = None
