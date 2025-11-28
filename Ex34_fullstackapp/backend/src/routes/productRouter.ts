import express, { Router } from 'express';

import  {
    getProducts,
    getProductById,
    addProduct,
    editProduct,
    getSeoDescription
} from "../controllers/productController";

import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRole } from '../middlewares/roleMiddleware';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);
productRouter.post('/', authenticateToken, authorizeRole('EMPLOYEE'), addProduct);
productRouter.put('/:id', authenticateToken, authorizeRole('EMPLOYEE'), editProduct);
productRouter.get('/:id/seo-description', authenticateToken, authorizeRole('EMPLOYEE'), getSeoDescription);

export default productRouter;