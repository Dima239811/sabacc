# 1️⃣ Сборка фронта
FROM node:lts-alpine3.20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2️⃣ Запуск через nginx
FROM nginx:stable-alpine3.19
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
