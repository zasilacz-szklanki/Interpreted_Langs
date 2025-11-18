import prisma from "../prisma/client";
import { RequestHandler } from 'express';

// getStatus
export const getStatus: RequestHandler = async (req, res) => {
    try {
        const status = await prisma.orderStatus.findMany();
        res.status(200).json({ data: status });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}