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

# 3. Откройте в браузере
# http://localhost:3000

## Использованные технологии:

### Фронтенд
React 18 + Hooks 
React Router DOM 
Vite — сборка и дев-сервер
LocalStorage — хранение данных на клиенте

### Инфраструктура
Docker + Docker Compose — контейнеризация
Nginx — раздача статики и поддержка client-side routing
Multi-stage build — оптимизация размера образа