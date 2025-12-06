# 1️⃣ Stage — build React
FROM node:lts-alpine3.20 AS build
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2️⃣ Stage — nginx serving
FROM nginx:stable-alpine

# копируем собранный фронт в место, откуда nginx отдает статику
COPY --from=build /app/dist /usr/share/nginx/html

# копируем конфиг nginx внутрь контейнера
COPY app.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
