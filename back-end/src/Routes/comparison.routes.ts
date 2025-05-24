import express from 'express';
import multer from 'multer';
import { handleMergeData } from '../Controllers/comparison.controller';
import {authenticateJWT} from "../Middleware/auth.middleware";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
router.use(authenticateJWT);

router.post(
    '/merge-data',
    upload.fields([
        { name: 'crimeData', maxCount: 1 },
        { name: 'unemploymentData', maxCount: 1 }
    ]),
    handleMergeData
);

export default router;
