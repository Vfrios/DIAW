FROM node:24-alpine AS frontend-build

WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@12.5.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json
RUN pnpm install --frozen-lockfile

COPY frontend ./frontend
RUN pnpm --dir frontend build

FROM maven:3.9-eclipse-temurin-25 AS backend-build

WORKDIR /workspace
COPY backend/pom.xml ./backend/pom.xml
COPY backend/src ./backend/src
COPY --from=frontend-build /workspace/frontend/dist ./backend/src/main/resources/static
RUN mvn -B -f backend/pom.xml package

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=backend-build /workspace/backend/target/aluguel-carros-1.0.0.jar ./app.jar

ENV SERVER_ADDRESS=0.0.0.0
EXPOSE 10000

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
