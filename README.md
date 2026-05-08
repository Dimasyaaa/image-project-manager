# Image Project Manager

Веб-приложение для управления проектами и аннотации изображений (bounding boxes).

## Как запустить

### Через Docker

```bash
# 1. Клонируйте репозиторий
git clone <URL-репозитория>
cd image-project-manager

# 2. Соберите и запустите контейнер
docker compose up --build

# 3. Откройте в браузере:
# Фронтенд: http://localhost:3000
# Swagger UI (документация API): http://localhost:8000/docs
```

## Использованные технологии:
### Фронтенд
React 

Vite 

### Бэкенд
FastAPI

SQLAlchemy (ORM)

Uvicorn

### Инфраструктура
Docker + Docker Compose

Nginx — раздача статики и поддержка client-side routing

Multi-stage build — оптимизация размера образа

PostgreSQL 15 - хранение метаданных проектов, изображений, аннотаций

