import express from 'express';
import multer from 'multer';
import { handleMergeData } from '../Controllers/comparison.controller';
import {authenticateJWT} from "../Middleware/auth.middleware";

const router = express.Router();
router.use(authenticateJWT);

router.post('/merge-data', express.json(), handleMergeData);

export default router;
