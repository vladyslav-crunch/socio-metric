import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../Entities/User';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the .env file');
}

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user: User): string {
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email
    }
    return jwt.sign(payload, JWT_SECRET, {expiresIn: "1d"});
}

export function verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string') {
        throw new Error('Invalid token payload');
    }
    return decoded as JwtPayload;
}
