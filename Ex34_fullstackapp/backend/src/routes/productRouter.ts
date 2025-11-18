import express, { Router } from 'express';

import  { getProducts, getProductById, addProduct, editProduct } from "../controllers/productController";

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);
productRouter.post('/', addProduct);
productRouter.put('/:id', editProduct);

export default productRouter;