"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductAPI, CategoryAPI } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { Category } from "@/lib/types";
import Link from "next/link";
import { FiArrowLeft, FiPlus, FiSave } from "react-icons/fi";

export default function AddProductPage() {
    const { isEmployee, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        unitPrice: "",
        unitWeight: "",
        categoryId: ""
    });

    useEffect(() => {
        if (!authLoading && !isEmployee) {
            router.push("/");
        }
    }, [isEmployee, authLoading, router]);

    useEffect(() => {
        if (!isEmployee) return;

        const fetchCategories = async () => {
            try {
                const response = await CategoryAPI.getAll();
                setCategories(response.data.data);
                if (response.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: response.data.data[0].id.toString() }));
                }
            } catch (err) {
                console.error("Failed to load categories", err);
                setError("Failed to load categories. Please try again.");
            }
        };

        fetchCategories();
    }, [isEmployee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                unitPrice: parseFloat(formData.unitPrice),
                unitWeight: parseFloat(formData.unitWeight),
                categoryId: parseInt(formData.categoryId)
            };

            await ProductAPI.create(payload);

            alert("Product created successfully!");
            router.push("/admin");
            router.refresh();

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to create product.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-8 my-5">

            <div className="flex items-center gap-4">
                <div>
                    <Link href="/admin" className="text-sm text-gray-400 hover:text-primary transition-colors mb-2 block">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
                    <p className="text-gray-400">Fill in the details to create a new item.</p>
                </div>
            </div>

            <div className="card p-8 border border-border bg-card shadow-lg">

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-foreground placeholder:text-gray-600"
                            placeholder="e.g. Gaming Mouse"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                        <div className="relative">
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-foreground appearance-none"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Price (PLN)</label>
                            <input
                                type="number"
                                name="unitPrice"
                                step="0.01"
                                min="0.01"
                                value={formData.unitPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                name="unitWeight"
                                step="0.01"
                                min="0.01"
                                value={formData.unitWeight}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={5}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-foreground placeholder:text-gray-600"
                            placeholder="Enter product details..."
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-all hover:shadow-[0_0_20px_-5px_var(--color-primary)] disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
                        >
                            {loading ? "Creating..." : <><FiPlus /> Create Product</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}