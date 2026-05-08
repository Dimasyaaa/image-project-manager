from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from .annotation import AnnotationOut 

# изображение с метаданными
class ImageOut(BaseModel):
    id: int
    name: str
    url: str  # url фрона
    project_id: int
    created_at: Optional[datetime] = None
    annotations: List['AnnotationOut'] = []

    model_config = ConfigDict(from_attributes=True)

# загрузкa файла 
class ImageUpload(BaseModel):
    filename: str
    file_path: str  # путь на диске