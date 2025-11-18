import express, { Router } from 'express';

import  { getOrders, createOrder, updateOrderStatus, getOrdersByStatus } from "../controllers/orderController";

const orderRouter = Router();

orderRouter.get('/', getOrders);
orderRouter.post('/', createOrder);
orderRouter.patch('/:id', updateOrderStatus);
orderRouter.get('/status/:id', getOrdersByStatus);

export default orderRouter;