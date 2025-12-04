"use client";

import { useCart } from "@/providers/CartProvider";
import { OrderAPI } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { FiTrash2, FiMinus, FiPlus, FiCheckCircle } from "react-icons/fi";

export default function CheckoutPage() {
    const { items, addToCart, decreaseQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const router = useRouter();

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successId, setSuccessId] = useState<number | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9\s+]+$/;

        if (!formData.customerName.trim()) {
            setError("Name is required.");
            return;
        }
        if (!emailRegex.test(formData.customerEmail)) {
            setError("Invalid email address.");
            return;
        }
        if (!phoneRegex.test(formData.customerPhone)) {
            setError("Invalid phone number (digits only).");
            return;
        }

        setLoading(true);

        try {
            const orderPayload = {
                ...formData,
                statusId: 1,
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                }))
            };

            const response = await OrderAPI.create(orderPayload);

            clearCart();
            setSuccessId(response.data.data.id);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isClient) return null;

    if (successId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="text-green-500">
                    <FiCheckCircle size={80} />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Order Placed!</h1>
                <p className="text-gray-400">
                    Thank you for your purchase. Your order ID is <strong className="text-primary">#{successId}</strong>.
                </p>
                <Link href="/" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg transition-colors">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto my-5">
            <h1 className="text-center text-3xl font-bold mb-8 text-foreground">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6 border-border bg-card">
                        <h2 className="text-xl font-semibold mb-4 text-foreground">Your Items</h2>

                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.product.id} className="flex items-center gap-4 py-4 border-b border-border last:border-0">

                                    <div className="w-20 h-20 bg-utility rounded-md flex items-center text-center justify-center text-xs text-gray-500 shrink-0">
                                        {item.product.name}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-medium text-foreground">{item.product.name}</h3>
                                        <p className="text-sm text-gray-400">{item.product.category?.name}</p>
                                        <p className="text-sm font-bold text-primary mt-1">
                                            {item.product.unitPrice.toFixed(2)} PLN
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-utility/50 rounded-lg p-1">
                                        <button
                                            onClick={() => decreaseQuantity(item.product.id)}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-50 text-foreground"
                                            disabled={item.quantity <= 1}
                                        >
                                            <FiMinus size={16} />
                                        </button>
                                        <span className="text-sm font-medium w-6 text-center text-foreground">{item.quantity}</span>
                                        <button
                                            onClick={() => addToCart(item.product)}
                                            className="p-1 hover:bg-white/10 rounded text-foreground"
                                        >
                                            <FiPlus size={16} />
                                        </button>
                                    </div>

                                    <div className="text-right w-24 hidden sm:block font-medium text-foreground">
                                        {(item.product.unitPrice * item.quantity).toFixed(2)} PLN
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                                        aria-label="Remove item"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="card p-6 border-border bg-card sticky top-24">
                        <h2 className="text-xl font-semibold mb-6 text-foreground">Contact Details</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                    placeholder="Walter White"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="customerEmail"
                                    value={formData.customerEmail}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                    placeholder="walter@white.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                    placeholder="123456789"
                                    maxLength={9}
                                />
                            </div>

                            <div className="pt-4 mt-6 border-t border-border">
                                <div className="flex justify-between items-center text-lg font-bold text-foreground">
                                    <span>Total:</span>
                                    <span>{cartTotal.toFixed(2)} PLN</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-[0_0_20px_-5px_var(--color-primary)] disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Confirm Order"}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}