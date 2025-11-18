import prisma from "../prisma/client";
import { RequestHandler } from 'express';

// getCategories
export const getCategories: RequestHandler = async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json({ data: categories });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}