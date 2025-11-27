import express, { Router } from 'express';

import  {
    getOrders,
    createOrder,
    updateOrderStatus,
    getOrdersByStatus,
    addOrderOpinion
} from "../controllers/orderController";

const orderRouter = Router();

orderRouter.get('/', getOrders);
orderRouter.post('/', createOrder);
orderRouter.patch('/:id', updateOrderStatus);
orderRouter.get('/status/:id', getOrdersByStatus);
orderRouter.post('/:id/opinions', addOrderOpinion);

export default orderRouter;