import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { AppDataSource } from "./data-source";
import authRoutes from "./Routes/auth.routes";
import mergeRoutes from "./Routes/comparison.routes";
import cors from "cors";
import logger from "./Middleware/logger";

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
if (!PORT) {
  console.error("Missing PORT in .env");
  process.exit(1);
}

app.use(express.json());
app.use(logger);

app.use("/auth", authRoutes);
app.use("/comparison", mergeRoutes);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

AppDataSource.initialize()
  .then(() => console.log("Data source initialized successfully."))
  .catch((err) => console.error("Data source init error", err));

//soap
import * as soap from 'soap';
import * as fs from 'fs';
import * as http from 'http';
import { soapService } from './soap/soap.service';

const wsdlXml = fs.readFileSync('./src/soap/service.wsdl', 'utf8');

const server = http.createServer(app);

soap.listen(server, '/soap/getData', soapService, wsdlXml);

server.listen(PORT, () => {
    console.log(`HTTP & SOAP Server running on port ${PORT}`);
});