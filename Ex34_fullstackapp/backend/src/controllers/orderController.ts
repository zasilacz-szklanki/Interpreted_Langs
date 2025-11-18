import prisma from '../prisma/client';
import { RequestHandler } from 'express';

// getOrders
export const getOrders: RequestHandler = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: true,
                status: true,
            }
        });
        res.status(200).json({ data: orders });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}

// createOrder
export const createOrder: RequestHandler = async (req, res) => {
    const { customerName, customerEmail, customerPhone, statusId, items } = req.body;

    try {
        const newOrder = await prisma.order.create({
            data: {
                customerName,
                customerEmail,
                customerPhone,
                status: { connect: { id: Number(statusId) } },
                orderItems: {
                    create: items.map((item: any) => ({
                        product: { connect: { id: Number(item.productId) } },
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.unitPrice)
                    }))
                }
            },
            include: {
                orderItems: true,
            }
        });
        res.status(201).json({ data: newOrder });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}

// updateOrderStatus
export const updateOrderStatus: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const { statusId } = req.body;

    try {
        const updatedOrder = await prisma.order.update({
            where: { id: Number(id) },
            data: { statusId: Number(statusId) },
            include: { status: true }
        });
        res.status(200).json({ data: updatedOrder });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}

// getOrdersByStatus
export const getOrdersByStatus: RequestHandler = async (req, res) => {
    const { id } = req.params;

    try {
        const orders = await prisma.order.findMany({
            where: { statusId: Number(id) },
            include: {
                orderItems: true,
                status: true
            }
        });
        res.status(200).json({ data: orders });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e });
    }
}