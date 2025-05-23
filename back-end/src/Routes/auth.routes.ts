import { Router } from 'express';
import { register, login } from '../Controllers/auth.controller';
// import {authenticateJWT} from "../Middleware/auth.middleware";

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;