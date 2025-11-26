import prisma from "../prisma/client";
import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import axios from 'axios';

// getProducts
export const getProducts: RequestHandler = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true }
        });
        res.status(StatusCodes.OK).json({ data: products });
    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}

// getProductById
export const getProductById: RequestHandler = async (req, res) => {
    const { id } = req.params;

    if (isNaN(Number(id))) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid product ID format' });
        return;
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: { category: true }
        });

        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Product does not exist' });
            return;
        }

        res.status(StatusCodes.OK).json({ data: product });
    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}

// addProduct
export const addProduct: RequestHandler = async (req, res) => {
    const { name, description, unitPrice, unitWeight, categoryId } = req.body;

    if (!name || name.trim() === '') {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Product name is required' });
        return;
    }
    if (!description || description.trim() === '') {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Product description is required' });
        return;
    }

    const price = Number(unitPrice);
    const weight = Number(unitWeight);
    const catId = Number(categoryId);

    if (isNaN(price) || price <= 0) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Price must be a number greater than 0' });
        return;
    }
    if (isNaN(weight) || weight <= 0) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Weight must be a number greater than 0' });
        return;
    }
    if (isNaN(catId)) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Category ID must be a valid number' });
        return;
    }

    try {
        const categoryExists = await prisma.category.findUnique({ where: { id: catId } });
        if (!categoryExists) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Selected category does not exist' });
            return;
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                unitPrice: Number(unitPrice),
                unitWeight: Number(unitWeight),
                categoryId: Number(categoryId)
            },
        });
        res.status(StatusCodes.CREATED).json({ data: newProduct });
    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create product' });
    }
}

// editProduct
export const editProduct: RequestHandler = async (req, res) => {
    const productId = req.params.id;
    const { name, description, unitPrice, unitWeight, categoryId } = req.body;

    if (isNaN(Number(productId))) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid product ID format' });
        return;
    }

    try {
        const existingProduct = await prisma.product.findUnique({ where: { id: Number(productId) } });
        if (!existingProduct) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Product not found' });
            return;
        }

        if (name !== undefined && name.trim() === '') {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Product name cannot be empty' });
            return;
        }
        if (description !== undefined && description.trim() === '') {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Product description cannot be empty' });
            return;
        }
        if (unitPrice !== undefined && (isNaN(Number(unitPrice)) || Number(unitPrice) <= 0)) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Price must be a number greater than 0' });
            return;
        }
        if (unitWeight !== undefined && (isNaN(Number(unitWeight)) || Number(unitWeight) <= 0)) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Weight must be a number greater than 0' });
            return;
        }

        if (categoryId !== undefined) {
            const categoryExists = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
            if (!categoryExists) {
                res.status(StatusCodes.BAD_REQUEST).json({ error: 'Selected category does not exist' });
                return;
            }
        }

        const product = await prisma.product.update({
            where: { id: Number(productId) },
            data: {
                name,
                description,
                unitPrice: unitPrice !== undefined ? Number(unitPrice) : undefined,
                unitWeight: unitWeight !== undefined ? Number(unitWeight) : undefined,
                categoryId: categoryId !== undefined ? Number(categoryId) : undefined
            },
        });
        res.status(StatusCodes.OK).json({ data: product });
    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to edit product' });
    }
}

// getSeoDescription
export const getSeoDescription: RequestHandler = async (req, res) => {
    const { id } = req.params;

    if (isNaN(Number(id))) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid product ID format' });
        return;
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: { category: true }
        });

        if (!product) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Product not found' });
            return;
        }

        const prompt = ``;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama3-8b-8192",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        const seoDescription = response.data.choices[0].message.content;

        res.status(StatusCodes.OK).json({
            data: {
                productId: product.id,
                seoDescription: seoDescription
            }
        });

    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to generate SEO description' });
    }
}