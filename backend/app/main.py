from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .database import engine, Base
from .models import Project, Image, Annotation

# таблицы
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Image Project Manager API",
    description="Backend image annotation project",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# раздачa изображениq
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(UPLOAD_DIR)), name="static")

# все роутеры
from .routes import projects, images, image_manage, annotations

app.include_router(projects.router)
app.include_router(images.router)      # POST/GET /projects/{id}/images
app.include_router(image_manage.router) # DELETE /images/{id}, GET /images/{id}/file
app.include_router(annotations.router)  # CRUD для аннотаций

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}