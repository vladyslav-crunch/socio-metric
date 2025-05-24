import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../Entities/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const repo = AppDataSource.getRepository(User);
    const existing = await repo.findOneBy({ email });
    if (existing) {
        res.status(400).json({message: 'Email taken'});
        return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = repo.create({ name, email, password: hashed });
    await repo.save(user);
    const token = generateToken(user);
    res.status(201).json({ message: 'User registered', user, token });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    const token = generateToken(user!);
    res.json({ user, token });
};