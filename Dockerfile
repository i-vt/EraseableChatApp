FROM eclipse-temurin:23-jdk AS build
WORKDIR /workspace

COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew

COPY src src

RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:23-jre
WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=dev \
    JAVA_OPTS="" \
    SERVER_PORT=8080

COPY --from=build /workspace/build/libs/*-SNAPSHOT.jar /app/app.jar

EXPOSE 8080 8443

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${SERVER_PORT} -jar /app/app.jar"]
