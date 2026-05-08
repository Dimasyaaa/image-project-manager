import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from ..database import get_db
from ..models import Image, Annotation
from ..schemas.image import ImageOut

router = APIRouter(prefix="/images", tags=["image-management"])

UPLOAD_DIR = Path("uploads")

@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(image_id: int, db: Session = Depends(get_db)):
    # Удалить изображение и все его аннотации + файл с диска
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Удаляем файл 
    # Извлекаем относительный путь из URL: http://.../static/123/abc.jpg → 123/abc.jpg
    if "/static/" in image.url:
        relative_path = image.url.split("/static/")[-1]
        file_path = UPLOAD_DIR / relative_path
        if file_path.exists():
            file_path.unlink()  # удаляем файл
    
    # Каскад: аннотации удалятся автоматически благодаря relationship(cascade="all, delete-orphan")
    db.delete(image)
    db.commit()
    return None

#  Эндпоинт для раздачи изображений
@router.get("/{image_id}/file")
def get_image_file(image_id: int, db: Session = Depends(get_db)):
    """Скачать оригинал изображения по ID"""
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # путь из URL
    if "/static/" in image.url:
        relative_path = image.url.split("/static/")[-1]
        file_path = UPLOAD_DIR / relative_path
        if file_path.exists():
            return FileResponse(file_path, filename=image.name)
    
    raise HTTPException(status_code=404, detail="File not found on disk")