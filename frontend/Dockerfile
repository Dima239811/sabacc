# 1️⃣ Stage — сборка React
FROM node:lts-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2️⃣ Stage — nginx
FROM nginx:stable-alpine

# Копируем готовый билд React
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфиг nginx
COPY app.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]