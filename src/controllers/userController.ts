import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

const passwordValidation = (password: string) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!passwordValidation(password)) {
    return res.status(400).json({ error: 'Password Debole, deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale.' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email o Username già in uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'User registration failed', details: error.message });
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
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed', details: error.message });
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
  } catch (error: any) {
    res.status(500).json({ error: 'User update failed', details: error.message });
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
  } catch (error: any) {
    res.status(500).json({ error: 'User deletion failed', details: error.message });
  }
};

const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!passwordValidation(newPassword)) {
    return res.status(400).json({ error: 'Password Debole, deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un carattere speciale.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user || !await bcrypt.compare(oldPassword, user.password)) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Password update failed', details: error.message });
  }
};

export { register, login, updateUser, deleteUser, getUserProfile, changePassword };
