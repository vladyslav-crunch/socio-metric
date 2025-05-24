import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../Entities/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { verifyToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOneBy({ email });
  if (existing) {
    res.status(400).json({ message: "This email is already taken" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = repo.create({ name, email, password: hashed });
  await repo.save(user);
  const token = generateToken(user);
  res.status(201).json({ message: "User registered", token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOneBy({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = generateToken(user!);
  res.json({ token });
};

export const getUser = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ id: payload.id });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ id: user.id, name: user.name });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
