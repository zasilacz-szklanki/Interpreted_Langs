"use client";

import { useEffect, useState } from "react";
import { OrderAPI } from "@/lib/api";
import { Order } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider"; // Żeby znać email usera
import OrderList from "@/components/OrderList";
import { useRouter } from "next/navigation";

export default function UserPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                const response = await OrderAPI.getAll();
                const allOrders = response.data.data;
                setOrders(allOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (authLoading || loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 my-5">
            <div className="border-b border-border pb-4 text-center">
                <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
                <p className="text-gray-400">Your purchase history</p>
            </div>

            <OrderList orders={orders} isAdmin={false} />
        </div>
    );
}