FROM maven:3.9.9-eclipse-temurin-21 AS build

ARG MODULE
WORKDIR /workspace

COPY pom.xml .
COPY backend ./backend
COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY eureka-server ./eureka-server
COPY merchant-service ./merchant-service
COPY terminal-service ./terminal-service
COPY transaction-service ./transaction-service
COPY risk-service ./risk-service
COPY settlement-service ./settlement-service
COPY ops-service ./ops-service

RUN mvn -pl ${MODULE} -am -DskipTests package

FROM eclipse-temurin:21-jre

ARG MODULE
WORKDIR /app

COPY --from=build /workspace/${MODULE}/target/${MODULE}-1.0.0.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]