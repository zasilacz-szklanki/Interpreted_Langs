import express, { Router } from 'express';

import  {
    getProducts,
    getProductById,
    addProduct,
    editProduct,
    getSeoDescription
} from "../controllers/productController";

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);
productRouter.post('/', addProduct);
productRouter.put('/:id', editProduct);
productRouter.get('/:id/seo-description', getSeoDescription);

export default productRouter;