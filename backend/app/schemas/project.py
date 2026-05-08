from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# создания проекта
class ProjectCreate(BaseModel):
    title: str

# проект с изображениями
class ImageOut(BaseModel):
    id: int
    name: str
    url: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # SQLAlchemy ORM

class ProjectOut(BaseModel):
    id: int
    title: str
    created_at: Optional[datetime] = None
    images: List[ImageOut] = []

    class Config:
        from_attributes = True