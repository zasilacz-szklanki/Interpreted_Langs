import prisma from "../prisma/client";
import { RequestHandler } from 'express';

// getProducts
export const getProducts: RequestHandler = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true }
        });
        res.status(200).json({ data: products });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}

// getProductById
export const getProductById: RequestHandler = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: { category: true }
        });
        res.status(200).json({ data: product });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}

// addProduct
export const addProduct: RequestHandler = async (req, res) => {
    const { name, description, unitPrice, unitWeight, categoryId } = req.body;

    try {
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                unitPrice: Number(unitPrice),
                unitWeight: Number(unitWeight),
                categoryId: Number(categoryId)
            },
        });
        res.status(201).json({ data: newProduct });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}

// editProduct
export const editProduct: RequestHandler = async (req, res) => {
    const productId = req.params.id;
    const { name, description, unitPrice, unitWeight, categoryId } = req.body;

    try {
        const product = await prisma.product.update({
            where: { id: Number(productId) },
            data: {
                name,
                description,
                unitPrice: Number(unitPrice),
                unitWeight: Number(unitWeight),
                categoryId: Number(categoryId)
            },
        });
        res.status(200).json({ data: product });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}