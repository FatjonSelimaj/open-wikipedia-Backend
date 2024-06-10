import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Token missing');
    return res.sendStatus(401);
  }

  jwt.verify(token, SECRET_KEY, async (err: any, user: any) => {
    if (err) {
      console.log('Invalid token');
      return res.sendStatus(403);
    }

    try {
      const userData = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!userData) {
        console.log('User not found');
        return res.sendStatus(403);
      }

      req.userId = user.userId;
      next();
    } catch (error) {
      console.log('Error fetching user data:', error);
      return res.sendStatus(500);
    }
  });
};

export { authenticateToken };
