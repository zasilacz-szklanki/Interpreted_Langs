"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { FiShoppingBag, FiDatabase, FiSettings } from "react-icons/fi";

export default function AdminDashboard() {
    const { isEmployee, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isEmployee) {
            router.push("/");
        }
    }, [isEmployee, isLoading, router]);

    if (isLoading || !isEmployee) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-10">

            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-yellow-500">Admin Dashboard</h1>
                <p className="text-gray-400 text-lg">Welcome back. Select an action to proceed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

                <Link
                    href="/admin/orders"
                    className="card p-8 hover:border-yellow-500/50 transition-all group flex flex-col items-center text-center gap-4 hover:bg-utility/30"
                >
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                        <FiShoppingBag size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Manage Orders</h2>
                        <p className="text-gray-400 mt-2 text-sm">
                            View list of all orders, update statuses and check details.
                        </p>
                    </div>
                </Link>

                <Link
                    href="/admin/init"
                    className="card p-8 hover:border-blue-500/50 transition-all group flex flex-col items-center text-center gap-4 hover:bg-utility/30"
                >
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <FiDatabase size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Database Initialization</h2>
                        <p className="text-gray-400 mt-2 text-sm">
                            Import products from JSON file. Available only if database is empty.
                        </p>
                    </div>
                </Link>

            </div>
        </div>
    );
}