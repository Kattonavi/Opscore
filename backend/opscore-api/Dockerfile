# syntax=docker/dockerfile:1.7

# -------- Stage 1: build --------
# Eclipse Temurin 25 + Maven 3.9 (official Maven image on Docker Hub).
#   https://hub.docker.com/_/maven
# The "3.9-eclipse-temurin-25" tag tracks the latest Maven 3.9.x patch on
# Temurin 25. Pin to a specific patch (e.g. maven:3.9.16-eclipse-temurin-25)
# when reproducibility matters.
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace

# Cache dependencies first to speed up subsequent builds.
# We invoke `mvn` directly here instead of `./mvnw` so that the wrapper
# download is skipped on every build and only Maven Central is hit once.
COPY pom.xml ./
RUN mvn -B -ntp -f pom.xml dependency:go-offline

# Now copy sources and package.
COPY src src
RUN mvn -B -ntp -f pom.xml clean package -DskipTests

# -------- Stage 2: runtime --------
# JRE-only image to keep the final container small.
FROM eclipse-temurin:25-jre
WORKDIR /app

# Drop privileges.
RUN groupadd --system app && useradd --system --gid app --home /app app

# Copy ONLY the Spring Boot repackaged fat jar (not the .original sibling
# produced by spring-boot-maven-plugin:repackage).
COPY --from=build /workspace/target/opscore-api-*.jar /app/app.jar

USER app

# Railway injects PORT at runtime. The app reads it via server.port=${PORT:8080}.
EXPOSE 8080

ENV JAVA_OPTS=""

# Use exec form so the JVM receives signals (graceful shutdown on Railway redeploy).
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
