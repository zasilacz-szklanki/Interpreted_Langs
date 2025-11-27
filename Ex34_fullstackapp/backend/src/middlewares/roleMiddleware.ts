import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest } from './authMiddleware';

export const authorizeRole = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User context missing' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'Access denied: Insufficient permissions' });
            return;
        }

        next();
    };
};