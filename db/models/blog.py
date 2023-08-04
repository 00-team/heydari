

from pydantic import BaseModel
from sqlalchemy import TEXT, Column, Integer, String, text

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


class BlogModel(BaseModel):
    blog_id: int
    slug: str
    title: str
    description: str
    content: str
    author: int
    timestamp: int
