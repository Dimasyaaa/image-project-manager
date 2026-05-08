from pydantic import BaseModel, ConfigDict
from typing import Optional

class AnnotationCreate(BaseModel):
    class_name: str
    x: float  
    y: float
    width: float
    height: float

class AnnotationOut(BaseModel):
    id: int
    class_name: str
    x: float
    y: float
    width: float
    height: float

    model_config = ConfigDict(from_attributes=True)