import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Backend Node.js API",
        description: "API en NodeJS",
        version: "1.0.0"
    },
    host: "localhost:3030",
    schemes: "http"
}

const outputFile = "./swagger-output.json"
const routes = ["./src/index.ts"]

swaggerAutogen(outputFile, routes, doc);