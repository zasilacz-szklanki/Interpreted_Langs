import { Request, Response, RequestHandler } from 'express';
import prisma from '../prisma/client';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateTokens = (user: any) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

export const register: RequestHandler = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Email and password required' });
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'CLIENT'
            }
        });

        res.status(StatusCodes.CREATED).json({ message: 'User created', userId: newUser.id });
    } catch (e) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'User already exists or error' });
    }
}

export const login: RequestHandler = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
            return;
        }

        const tokens = generateTokens(user);
        res.json(tokens);

    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Login failed' });
    }
}

export const refreshToken: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Refresh token required' });
        return;
    }

    try {
        const payload: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);

        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not found' });
            return;
        }
        
        const tokens = generateTokens(user);
        res.json(tokens);

    } catch (e) {
        res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid refresh token' });
    }
}