"use client";

import { Order, OrderStatus } from "@/lib/types";
import { useState } from "react";
import { OrderAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FiMessageSquare, FiStar } from "react-icons/fi";
import ReviewModal from "./ReviewModal";

interface OrderListProps {
    orders: Order[];
    isAdmin?: boolean;
    statuses?: OrderStatus[];
    onRefresh?: () => void;
}

export default function OrderList({ orders, isAdmin = false, statuses = [], onRefresh }: OrderListProps) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState<number | null>(null);

    const handleStatusChange = async (orderId: number, newStatusId: number) => {
        if (!confirm("Are you sure you want to change the status?")) return;
        setLoadingId(orderId);
        try {
            await OrderAPI.updateStatus(orderId, newStatusId);
            if (onRefresh) onRefresh();
            else router.refresh();
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to change status");
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusColor = (statusName?: string) => {
        switch (statusName) {
            case 'ZREALIZOWANE': case 'COMPLETED': return 'text-green-500 border-green-500/30 bg-green-500/10';
            case 'ANULOWANE': case 'CANCELLED': return 'text-red-500 border-red-500/30 bg-red-500/10';
            case 'ZATWIERDZONE': case 'APPROVED': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
            default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
        }
    };

    const canReview = (order: Order) => {
        const allowedStatuses = ['ZREALIZOWANE', 'ANULOWANE', 'COMPLETED', 'CANCELLED'];
        const isFinished = allowedStatuses.includes(order.status?.name || "");
        const hasNoOpinion = !order.opinion;

        return isFinished && hasNoOpinion;
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <FiStar
                key={i}
                className={i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}
                size={14}
            />
        ));
    };

    if (orders.length === 0) {
        return <div className="text-center py-10 text-gray-500">No orders found.</div>;
    }

    return (
        <div className="space-y-6">

            {reviewModalOpen && (
                <ReviewModal
                    orderId={reviewModalOpen}
                    onClose={() => {
                        setReviewModalOpen(null);
                        if (onRefresh) onRefresh(); else router.refresh();
                    }}
                />
            )}

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
                                    {new Date(order.createdAt).toLocaleString('en-US')}
                                </p>
                                {isAdmin && (
                                    <p className="text-xs text-primary mt-1">
                                        Client: {order.customerName} ({order.customerEmail})
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
                                        <div className="w-8 h-8 bg-utility rounded flex items-center justify-center text-[10px] text-gray-500 shrink-0">
                                            Product
                                        </div>
                                        <div>
                                            <span className="text-foreground font-medium block">
                                                {item.product?.name || "Unknown Product"}
                                            </span>
                                            <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-400 font-mono">
                                        {item.unitPrice.toFixed(2)} PLN
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex justify-end">

                            {!isAdmin && canReview(order) && (
                                <button
                                    onClick={() => setReviewModalOpen(order.id)}
                                    className="flex items-center gap-2 text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 rounded-md hover:bg-yellow-500/20"
                                >
                                    <FiMessageSquare /> Add Review
                                </button>
                            )}

                            {order.opinion && (
                                <div className="w-full bg-utility/30 p-4 rounded-lg border border-border relative">
                                    <div className="absolute top-4 right-4 text-gray-500 text-xs">
                                        {new Date(order.opinion.createdAt).toLocaleDateString()}
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-0.5">
                                            {renderStars(order.opinion.rating)}
                                        </div>
                                        <span className="text-yellow-500 text-sm font-bold ml-1">
                                            {order.opinion.rating}/5
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-300 italic pl-2 border-l-2 border-primary/50">
                                        "{order.opinion.content}"
                                    </p>
                                </div>
                            )}

                        </div>

                    </div>
                );
            })}
        </div>
    );
}