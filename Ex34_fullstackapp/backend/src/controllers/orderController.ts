import prisma from '../prisma/client';
import { RequestHandler } from 'express';
import { StatusCodes } from "http-status-codes";
import { AuthRequest } from '../middlewares/authMiddleware';

const STATUS_RANK: Record<string, number> = {
    'NOT APPROVED': 1,
    'APPROVED': 2,
    'COMPLETED': 3,
    'CANCELLED': 4
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^[0-9\s+]+$/.test(phone) && !/[a-zA-Z]/.test(phone);

// getOrders
export const getOrders: RequestHandler = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: { product: true },
                },
                opinion: true,
                status: true,
            },
            orderBy: { id: 'desc' }
        });
        res.status(StatusCodes.OK).json({ data: orders });
    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}

// getUserOrders
export const getUserOrders: RequestHandler = async (req: AuthRequest, res) => {
    try {
        const userId = req.params.id;

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { email: true }
        });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
        }

        const orders = await prisma.order.findMany({
            where: {
                customerEmail: user.email
            },
            include: {
                orderItems: { include: { product: true } },
                status: true,
                opinion: true,
            },
            orderBy: { id: 'desc' }
        });

        res.status(StatusCodes.OK).json({ data: orders });

    } catch (e) {
        console.error(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}


// createOrder
export const createOrder: RequestHandler = async (req, res) => {
    const { customerName, customerEmail, customerPhone, statusId, items } = req.body;

    if (!customerName || customerName.trim() === '') {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Customer name is required' });
        return;
    }
    if (!customerEmail || !isValidEmail(customerEmail)) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid email format' });
        return;
    }
    if (!customerPhone || !isValidPhone(customerPhone)) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid phone number format' });
        return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Order must contain at least one item' });
        return;
    }

    for (const item of items) {
        if (!item.quantity || Number(item.quantity) <= 0) {
            res.status(StatusCodes.BAD_REQUEST).json({
                error: `Quantity for product ID ${item.productId} must be greater than 0`
            });
            return;
        }
    }

    try {
        const productIds = items.map((i: any) => Number(i.productId));
        const productsInDb = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                unitPrice: true
            }
        });

        if (productsInDb.length !== productIds.length) {
            const existingIds = productsInDb.map(p => p.id);
            const missingIds = productIds.filter((id: number) => !existingIds.includes(id));

            res.status(StatusCodes.BAD_REQUEST).json({
                error: `One or more products do not exist. Missing IDs: ${missingIds.join(', ')}`
            });
            return;
        }

        const newOrder = await prisma.order.create({
            data: {
                customerName,
                customerEmail,
                customerPhone,
                status: { connect: { id: Number(statusId) } },
                orderItems: {
                    create: items.map((item: any) => {
                        const dbProduct = productsInDb.find(p => p.id === Number(item.productId));

                        const currentPrice = dbProduct ? dbProduct.unitPrice : 0;

                        return {
                            product: { connect: { id: Number(item.productId) } },
                            quantity: Number(item.quantity),
                            unitPrice: currentPrice
                        };
                    })
                }
            },
            include: {
                orderItems: true,
            }
        });
        res.status(StatusCodes.CREATED).json({ data: newOrder });
    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create order' });
    }
}

// updateOrderStatus
export const updateOrderStatus: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const { statusId } = req.body;

    if (isNaN(Number(id))) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid order ID' });
        return;
    }

    try {
        const currentOrder = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: { status: true }
        });

        const newStatusObj = await prisma.orderStatus.findUnique({
            where: { id: Number(statusId) }
        });

        if (!currentOrder) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Order not found' });
            return;
        }
        if (!newStatusObj) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Target status does not exist' });
            return;
        }

        const currentStatusName = currentOrder.status.name;
        const newStatusName = newStatusObj.name;

        if (currentStatusName === 'CANCELLED') {
            res.status(StatusCodes.BAD_REQUEST).json({
                error: 'Cannot modify a cancelled order'
            });
            return;
        }

        if (newStatusName !== 'CANCELLED') {
            const currentRank = STATUS_RANK[currentStatusName] || 0;
            const newRank = STATUS_RANK[newStatusName] || 0;

            if (newRank < currentRank) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: `Cannot revert status from ${currentStatusName} to ${newStatusName}.`
                });
                return;
            }
        }

        const updatedOrder = await prisma.order.update({
            where: { id: Number(id) },
            data: { statusId: Number(statusId) },
            include: { status: true }
        });

        res.status(StatusCodes.OK).json({ data: updatedOrder });
    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update order status' });
    }
}

// getOrdersByStatus
export const getOrdersByStatus: RequestHandler = async (req, res) => {
    const { id } = req.params;

    if (isNaN(Number(id))) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid status ID' });
        return;
    }

    try {
        const orders = await prisma.order.findMany({
            where: { statusId: Number(id) },
            include: {
                orderItems: {
                    include: { product: true }
                },
                status: true
            }
        });
        res.status(StatusCodes.OK).json({ data: orders });
    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
}

// addOrderOpinion
export const addOrderOpinion: RequestHandler = async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { rating, content } = req.body;

    if (isNaN(Number(rating)) || rating < 1 || rating > 5) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Rating must be an integer between 1 and 5' });
        return;
    }
    if (!content || content.trim() === '') {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Opinion content is required' });
        return;
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: {
                status: true,
                opinion: true
            }
        });

        if (!order) {
            res.status(StatusCodes.NOT_FOUND).json({ error: 'Order not found' });
            return;
        }

        const loggedUser = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!loggedUser || loggedUser.email !== order.customerEmail) {
            res.status(StatusCodes.FORBIDDEN).json({ error: 'You can only review your own orders' });
            return;
        }

        const allowedStatuses = ['COMPLETED', 'CANCELLED'];
        if (!allowedStatuses.includes(order.status.name)) {
            res.status(StatusCodes.BAD_REQUEST).json({
                error: 'You can only review orders that are COMPLETED or CANCELLED'
            });
            return;
        }

        if (order.opinion) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Order already has an opinion' });
            return;
        }

        const newOpinion = await prisma.opinion.create({
            data: {
                rating: Number(rating),
                content: content,
                orderId: order.id
            }
        });

        res.status(StatusCodes.CREATED).json({ data: newOpinion });

    } catch (e) {
        console.log(e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add opinion' });
    }
}