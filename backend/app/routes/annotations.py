from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Image, Annotation
from ..schemas.annotation import AnnotationCreate, AnnotationOut

router = APIRouter(prefix="/images/{image_id}/annotations", tags=["annotations"])

@router.post("/", response_model=AnnotationOut, status_code=status.HTTP_201_CREATED)
def create_annotation(
    image_id: int,
    annotation: AnnotationCreate,
    db: Session = Depends(get_db)
):
    # Создать аннотацию для изображения
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    db_annotation = Annotation(
        image_id=image_id,
        class_name=annotation.class_name,
        x=annotation.x,
        y=annotation.y,
        width=annotation.width,
        height=annotation.height
    )
    db.add(db_annotation)
    db.commit()
    db.refresh(db_annotation)
    return db_annotation

@router.get("/", response_model=List[AnnotationOut])
def get_annotations(image_id: int, db: Session = Depends(get_db)):
    # Получить все аннотации изображения
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image.annotations

@router.delete("/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_annotation(image_id: int, annotation_id: int, db: Session = Depends(get_db)):
    # Удалить аннотацию
    annotation = db.query(Annotation).filter(
        Annotation.id == annotation_id,
        Annotation.image_id == image_id
    ).first()
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found")
    db.delete(annotation)
    db.commit()
    return None