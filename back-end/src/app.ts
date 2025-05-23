import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import {AppDataSource} from "./data-source";
import authRoutes from "./Routes/auth.routes";
import {authenticateJWT} from "./Middleware/auth.middleware";

const app = express();
const PORT = process.env.PORT;

if (!PORT) {
    console.error("Missing PORT in .env");
    process.exit(1);
}

app.use(express.json());

app.use('/auth', authRoutes);

// app.use(authenticateJWT);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

AppDataSource.initialize()
    .then(() => console.log('Data source initialized successfully.'))
    .catch((err) => console.error('Data source init error', err));


