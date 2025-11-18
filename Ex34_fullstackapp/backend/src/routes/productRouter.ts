import express, { Router } from 'express';

import  { getProducts} from "../controllers/productController";

const productRouter = Router();

productRouter.get('/', getProducts);

export default productRouter;