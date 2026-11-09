# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS prepare
WORKDIR /workspace
COPY . .
RUN node deploy/validate.js \
    && node deploy/prepare.js

FROM maven:3.9-eclipse-temurin-17 AS build17
WORKDIR /workspace
COPY --from=prepare /workspace/projects /workspace/projects
COPY --from=prepare /workspace/build-plans /workspace/build-plans
COPY --from=prepare /workspace/output /workspace/output
RUN --mount=type=cache,target=/root/.m2 \
    if [ -f /workspace/build-plans/java-17.sh ]; then sh /workspace/build-plans/java-17.sh; fi

FROM maven:3.9-eclipse-temurin-21 AS build21
WORKDIR /workspace
COPY --from=prepare /workspace/projects /workspace/projects
COPY --from=prepare /workspace/build-plans /workspace/build-plans
COPY --from=prepare /workspace/output /workspace/output
RUN --mount=type=cache,target=/root/.m2 \
    if [ -f /workspace/build-plans/java-21.sh ]; then sh /workspace/build-plans/java-21.sh; fi

FROM maven:3.9-eclipse-temurin-25 AS build25
WORKDIR /workspace
COPY --from=prepare /workspace/projects /workspace/projects
COPY --from=prepare /workspace/build-plans /workspace/build-plans
COPY --from=prepare /workspace/output /workspace/output
RUN --mount=type=cache,target=/root/.m2 \
    if [ -f /workspace/build-plans/java-25.sh ]; then sh /workspace/build-plans/java-25.sh; fi

FROM eclipse-temurin:17-jre-alpine AS jre17
FROM eclipse-temurin:21-jre-alpine AS jre21
FROM eclipse-temurin:25-jre-alpine AS jre25

FROM node:24-alpine AS runtime
RUN apk add --no-cache nginx gettext
WORKDIR /app

COPY --from=jre17 /opt/java/openjdk /opt/java/17
COPY --from=jre21 /opt/java/openjdk /opt/java/21
COPY --from=jre25 /opt/java/openjdk /opt/java/25
COPY --from=build17 /workspace/output/ /app/apps/
COPY --from=build21 /workspace/output/ /app/apps/
COPY --from=build25 /workspace/output/ /app/apps/
COPY --from=prepare /workspace/site/ /usr/share/nginx/html/
COPY --from=prepare /workspace/custom/ /app/custom/
COPY --from=prepare /workspace/runtime/ /app/runtime/
COPY --from=prepare /workspace/nginx.conf.template /etc/nginx/nginx.conf.template
COPY deploy/orquestrador.js /app/deploy/orquestrador.js
COPY deploy/entrypoint.sh /app/deploy/entrypoint.sh
RUN chmod +x /app/deploy/entrypoint.sh

ENV PORT=10000 MODO=sob-demanda MAX_APPS=2 MEM_LIMIT_MB=360 IDLE_MINUTOS=10
EXPOSE 10000
ENTRYPOINT ["/app/deploy/entrypoint.sh"]
