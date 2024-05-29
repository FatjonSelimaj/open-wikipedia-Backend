import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'User registration failed', details: error.message });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Login failed', details: error.message });
  }
};

const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: username || user.username,
        email: email || user.email,
        password: hashedPassword,
      },
    });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: 'User update failed', details: error.message });
  }
};

const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User and associated articles deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'User deletion failed', details: error.message });
  }
};

const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId; // Assumendo che l'ID utente sia memorizzato in req.userId dal middleware di autenticazione
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

export { register, login, updateUser, deleteUser, getUserProfile };
