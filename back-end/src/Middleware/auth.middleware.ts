import { Request, Response, NextFunction } from 'express';
import { User } from '../Entities/User';
import { AppDataSource } from '../data-source';
import { verifyToken } from '../utils/jwt';
import { JwtPayload } from 'jsonwebtoken';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.sendStatus(401);
        return;
    }

    try {
        const payload = verifyToken(token) as JwtPayload & { id: number }; // Fix implicit any
        AppDataSource.getRepository(User).findOneBy({ id: payload.id })
            .then((user: User | null) => {
                if (!user) {
                    res.sendStatus(403);
                    return;
                }

                (req as any).user = user;
                next();
            })
            .catch(() => res.sendStatus(403));
    } catch {
        res.sendStatus(403);
    }
};