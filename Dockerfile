
# СБОРКА ПРИЛОЖЕНИЯ
FROM node:20-alpine AS build

# Рабочая папка внутри контейнера
WORKDIR /app

# Копируем только manifest-файлы сначала (для кэширования npm install)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

COPY . .

# Собираем продакшн-версию
RUN npm run build

# РАЗДАЧА СТАТИКИ 
FROM nginx:alpine
# Копируем конфиг nginx для поддержки React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Если Vite -> dist, если CRA -> build
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# nginx в фоне
CMD ["nginx", "-g", "daemon off;"]