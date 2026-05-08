import os
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Project, Image, Annotation
from ..schemas.image import ImageOut
from ..schemas.annotation import AnnotationCreate, AnnotationOut

router = APIRouter(prefix="/projects/{project_id}/images", tags=["images"])

# Настройки хранения (легко заменить на S3)
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

def generate_unique_filename(filename: str) -> str:
    # Генерирует уникальное имя файла, сохраняя расширение
    ext = Path(filename).suffix
    return f"{uuid.uuid4().hex}{ext}"

def save_file_locally(file: UploadFile, project_id: int) -> str:
    # Сохраняет файл локально и возвращает относительный путь
    unique_name = generate_unique_filename(file.filename)
    project_folder = UPLOAD_DIR / str(project_id)
    project_folder.mkdir(exist_ok=True)
    
    file_path = project_folder / unique_name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return f"{project_id}/{unique_name}"

def get_public_url(relative_path: str) -> str:
    # Возвращает публичный URL для изображения
    return f"{BASE_URL}/static/{relative_path}"

@router.post("/", response_model=List[ImageOut], status_code=status.HTTP_201_CREATED)
async def upload_images(
    project_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    # Загрузить одно или несколько изображений в проект
    # Проверка существования проекта
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    uploaded_images = []
    for file in files:
        if not file.content_type.startswith("image/"):
            continue  
        
        # Сохраняем файл
        relative_path = save_file_locally(file, project_id)
        public_url = get_public_url(relative_path)
        
        # запись в БД
        db_image = Image(
            name=file.filename,
            url=public_url,
            project_id=project_id
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        uploaded_images.append(db_image)
    
    return uploaded_images

@router.get("/", response_model=List[ImageOut])
def get_project_images(project_id: int, db: Session = Depends(get_db)):
    # Получить все изображения проекта с аннотациями
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.images

@router.get("/{image_id}", response_model=ImageOut)
def get_image(project_id: int, image_id: int, db: Session = Depends(get_db)):
    # Получить конкретное изображение с аннотациями
    image = db.query(Image).filter(
        Image.id == image_id,
        Image.project_id == project_id
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image