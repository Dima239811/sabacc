# 1️⃣ Сборка фронта
FROM node:lts-alpine3.20 AS build
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2️⃣ Только билд без nginx
FROM alpine:3.20
WORKDIR /app
COPY --from=build /app/dist /dist