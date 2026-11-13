FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn/ .mvn/
COPY src/ src/
RUN sh ./mvnw -B -ntp clean package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/finance-control-0.0.1-SNAPSHOT.jar app.jar
USER 10001:10001
ENTRYPOINT ["java", "-jar", "app.jar"]