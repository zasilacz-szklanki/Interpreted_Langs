"use client";

import { Order, OrderStatus } from "@/lib/types";
import { useState } from "react";
import { OrderAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

interface OrderListProps {
    orders: Order[];
    isAdmin?: boolean;
    statuses?: OrderStatus[];
    onRefresh? : () => void;
}

export default function OrderList({ orders, isAdmin = false, statuses = [], onRefresh }: OrderListProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleStatusChange = async (orderId: number, newStatusId: number) => {
        if (!confirm("Are you sure you want to change the status of this order?")) return;

        setLoadingId(orderId);
        try {
            await OrderAPI.updateStatus(orderId, newStatusId);
            if (onRefresh) {
                onRefresh();
            } else {
                router.refresh();
            }
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to change status");
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusColor = (statusName?: string) => {
        switch (statusName) {
            case 'COMPLETED': return 'text-green-500 border-green-500/30 bg-green-500/10';
            case 'CANCELLED': return 'text-red-500 border-red-500/30 bg-red-500/10';
            case 'APPROVED': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
            default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
        }
    };

    if (orders.length === 0) {
        return <div className="text-center py-10 text-gray-500">No orders to display.</div>;
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => {
                const totalAmount = order.orderItems?.reduce(
                    (sum, item) => sum + (item.unitPrice * item.quantity), 0
                ) || 0;

                return (
                    <div key={order.id} className="card p-6 border border-border bg-card">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4 mb-4 gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-foreground">
                                    Order #{order.id}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Date: {new Date(order.createdAt).toLocaleString('en-US')}
                                </p>
                                {isAdmin && (
                                    <p className="text-xs text-primary mt-1">
                                        Customer: {order.customerName} ({order.customerEmail})
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                {isAdmin ? (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={order.statusId}
                                            onChange={(e) => handleStatusChange(order.id, Number(e.target.value))}
                                            disabled={loadingId === order.id}
                                            className={`px-3 py-1.5 rounded text-sm border bg-(--color-input) focus:outline-none focus:ring-2 focus:ring-primary/50 ${getStatusColor(order.status?.name)}`}
                                        >
                                            {statuses.map(status => (
                                                <option key={status.id} value={status.id} className="bg-card text-foreground">
                                                    {status.name}
                                                </option>
                                            ))}
                                        </select>
                                        {loadingId === order.id && <span className="animate-spin text-primary">↻</span>}
                                    </div>
                                ) : (
                                    <span className={`px-3 py-1 rounded text-xs font-bold border ${getStatusColor(order.status?.name)}`}>
                                        {order.status?.name}
                                    </span>
                                )}

                                <div className="text-xl font-bold text-foreground whitespace-nowrap">
                                    {totalAmount.toFixed(2)} PLN
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {order.orderItems?.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-utility rounded flex items-center justify-center text-[10px] text-gray-500">
                                            IMG
                                        </div>
                                        <div>
                                            <span className="text-foreground font-medium">
                                                {item.product?.name || `Product #${item.productId}`}
                                            </span>
                                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        {item.unitPrice.toFixed(2)} PLN / item
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                );
            })}
        </div>
    );
}