import { Request, Response, NextFunction } from 'express';
import { User } from '../Entities/User';
import { AppDataSource } from '../data-source';
import {verifyToken} from "../utils/jwt";

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try {
        const payload = verifyToken(token);
        const user = await AppDataSource.getRepository(User).findOneBy({ id: payload.id });
        if (!user) return res.sendStatus(403);

        // req.user = user;
        next();
    } catch {
        return res.sendStatus(403);
    }
};
