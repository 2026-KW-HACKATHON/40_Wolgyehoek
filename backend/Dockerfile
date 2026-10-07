FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=build /app/build/libs/*SNAPSHOT.jar app.jar
RUN mkdir -p /app/data/media && chown -R 10001 /app/data
USER 10001
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
