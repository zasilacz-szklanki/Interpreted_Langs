import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Access token required' });
        return;
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET as string, (err: any, user: any) => {
        if (err) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid or expired token' });
            return;
        }

        req.user = user;
        
        next();
    });
};