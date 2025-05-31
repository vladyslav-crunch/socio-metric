// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import fs from "fs";
import * as soap from "soap";

import { AppDataSource } from "./data-source";
import authRoutes from "./Routes/auth.routes";
import mergeRoutes from "./Routes/comparison.routes";
import logger from "./Middleware/logger";
import { soapService } from "./soap/soap.service";

const PORT = process.env.PORT || 3000;
const FRONT_ORIGIN = "http://localhost:5173"; // <-- frontend origin

/* ----------  EXPRESS APP  ---------- */
const app = express();

// CORS for all REST routes
app.use(
  cors({
    origin: FRONT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "SOAPAction"],
  })
);

app.use(express.json());
app.use(logger);

app.use("/auth", authRoutes);
app.use("/comparison", mergeRoutes);

/* ----------  CORS MIDDLEWARE JUST FOR SOAP  ---------- */
app.use("/soap", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", FRONT_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, SOAPAction"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Pre-flight
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

/* ----------  SOAP SERVICE  ---------- */
const wsdl = fs.readFileSync("./src/soap/service.wsdl", "utf8");
// we mount on the *same* express app (still one port)
soap.listen(app, "/soap/getData", soapService, wsdl);

/* ----------  DB + HTTP SERVER  ---------- */
AppDataSource.initialize()
  .then(() => console.log("DB initialized"))
  .catch((err) => console.error("DB init error", err));

http
  .createServer(app)
  .listen(PORT, () =>
    console.log(`REST + SOAP server running on http://localhost:${PORT}`)
  );
