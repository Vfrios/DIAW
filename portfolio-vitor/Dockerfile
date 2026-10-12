# Etapa 1: compila Java + React (o Maven baixa o Node sozinho)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
COPY frontend ./frontend
COPY src ./src
RUN mvn -B -DskipTests package

# Etapa 2: imagem final só com o JRE
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/portfolio-1.0.0.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=70", "-jar", "app.jar"]
