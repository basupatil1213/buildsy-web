import express from "express";
import initialize from "./app.js";
import { configDotenv } from "dotenv";

configDotenv();


const app = express();

initialize(app);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`application is listening at port: ${PORT}`)
})

