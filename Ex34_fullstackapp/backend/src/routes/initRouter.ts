import { Router } from 'express';
import { initializeProducts } from '../controllers/productController';

const initRouter = Router();

initRouter.post('/', initializeProducts);

export default initRouter;