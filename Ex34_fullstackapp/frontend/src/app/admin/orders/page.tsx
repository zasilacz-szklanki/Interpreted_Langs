"use client";

import { useEffect, useState, useCallback } from "react";
import { OrderAPI, StatusAPI } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";
import OrderList from "@/components/OrderList";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminOrdersPage() {
    const { isEmployee, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [statuses, setStatuses] = useState<OrderStatus[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isEmployee) {
            router.push("/");
        }
    }, [isEmployee, authLoading, router]);

    const refreshData = useCallback(async () => {
        if (!isEmployee) return;

        try {
            const [ordersRes, statusesRes] = await Promise.all([
                OrderAPI.getAll(),
                StatusAPI.getAll()
            ]);
            setOrders(ordersRes.data.data);
            setStatuses(statusesRes.data.data);
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setLoading(false);
        }
    }, [isEmployee]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const filteredOrders = orders.filter(order => {
        if (filterStatus === "all") return true;
        return order.statusId === Number(filterStatus);
    });

    const sortedOrders = [...filteredOrders].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (authLoading || loading) return <div className="p-8 text-center">Loading panel...</div>;
    if (!isEmployee) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 my-5">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border pb-6">
                <div>
                    <Link href="/admin" className="text-sm text-gray-400 hover:text-primary transition-colors mb-2 block">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-yellow-500">Manage Orders</h1>
                    <p className="text-gray-400">View and update customer orders</p>
                </div>

                <div className="w-full md:w-64">
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Filter Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-(--color-input) border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">All</option>
                        {statuses.map(status => (
                            <option key={status.id} value={status.id}>{status.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <OrderList
                orders={sortedOrders}
                isAdmin={true}
                statuses={statuses}
                onRefresh={refreshData}
            />
        </div>
    );
}