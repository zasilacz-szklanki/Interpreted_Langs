import { PrismaClient } from "@prisma/client";

const productClient = new PrismaClient().product;

// getProducts
export const getProducts = async (req, res) => {
    try {
        const products = await productClient().findMany();
        res.status(200).json({ data: products });
    } catch (e) {
        console.log(e);
    }
}

// getProductById

// addProduct

// editProduct