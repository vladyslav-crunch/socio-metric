import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import {AppDataSource} from "./data-source";
import router from "./Routes/auth";
const PORT = process.env.PORT;

if (!PORT) {
    console.error("Missing PORT in .env");
    process.exit(1);
}

const app = express();

app.use(express.json());

app.use('/auth', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

AppDataSource.initialize().then(() => {
    console.log('Data source has been initialized successfully.');
})
    .catch((err) => {
        console.error('Error during data source initialization', err);
    })


