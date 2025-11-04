# Используем Temurin JDK для сборки, запускаем gradle wrapper чтобы гарантировать версию Gradle
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app

# Копируем весь проект (включая gradlew и gradle/wrapper)
COPY . .

# Делаем wrapper исполняемым и запускаем сборку через него
RUN chmod +x ./gradlew \
    && ./gradlew build --no-daemon -x test

# Финальный образ запуска
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

LABEL org.opencontainers.image.source="https://github.com/Ap1kkk/Sabacc"