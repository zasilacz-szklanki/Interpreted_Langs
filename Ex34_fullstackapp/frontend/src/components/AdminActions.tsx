"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { ProductAPI } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { useRouter } from "next/navigation";
// Dodałem FiCpu i FiRefreshCw (opcjonalnie do regeneracji)
import { FiEdit, FiTrash2, FiX, FiSave, FiAlertCircle, FiCpu } from "react-icons/fi";

interface AdminActionsProps {
    product: Product;
    categories: Category[];
}

export default function AdminActions({ product, categories }: AdminActionsProps) {
    const { isEmployee } = useAuth();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [seoLoading, setSeoLoading] = useState(false); // Stan ładowania AI
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description || "",
        unitPrice: product.unitPrice,
        unitWeight: product.unitWeight,
        categoryId: product.categoryId
    });

    if (!isEmployee) {
        return null;
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await ProductAPI.update(product.id, formData);
            setIsEditing(false);
            router.refresh();
        } catch (err: any) {
            const serverMessage = err.response?.data?.error || "Save failed.";
            setError(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    // 👇 NOWA FUNKCJA: Generowanie opisu
    const generateSeoDescription = async () => {
        if (formData.description && !confirm("The description field is not empty. Do you want to overwrite it with generated content?")) {
            return;
        }

        setSeoLoading(true);
        setError(null);

        try {
            // Zakładamy, że ProductAPI ma metodę getSeoDescription (dodaliśmy ją w api.ts wcześniej)
            const response = await ProductAPI.getSeoDescription(product.id);
            const generatedHtml = response.data.data.seoDescription;

            // Aktualizujemy formularz - użytkownik zobaczy nowy opis w textarea
            setFormData(prev => ({ ...prev, description: generatedHtml }));
        } catch (err: any) {
            console.error(err);
            setError("Failed to generate SEO description. Check server logs.");
        } finally {
            setSeoLoading(false);
        }
    };

    return (
        <>
            <div className="flex gap-2 mt-4 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
                <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider self-center mr-auto">
                    Admin Panel
                </span>

                <button
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                    onClick={() => { setError(null); setIsEditing(true); }}
                >
                    <FiEdit /> Edit
                </button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-utility/50">
                            <h3 className="text-lg font-bold text-foreground">Edit Product</h3>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded flex items-center gap-2">
                                    <FiAlertCircle size={18} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form id="edit-form" onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground placeholder:text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Price (PLN)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.unitPrice}
                                            onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                                            className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Unit weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.unitWeight}
                                            onChange={e => setFormData({ ...formData, unitWeight: parseFloat(e.target.value) })}
                                            className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-400">Description (HTML)</label>
                                        {/* 👇 PRZYCISK AI */}
                                        <button
                                            type="button"
                                            onClick={generateSeoDescription}
                                            disabled={seoLoading || loading}
                                            className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors"
                                        >
                                            {seoLoading ? (
                                                <span className="animate-pulse">Generating...</span>
                                            ) : (
                                                <><FiCpu /> Generate SEO with AI</>
                                            )}
                                        </button>
                                    </div>
                                    <textarea
                                        rows={6}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground font-mono text-sm"
                                        placeholder="<p>Product description...</p>"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">You can edit the generated HTML code before saving.</p>
                                </div>

                            </form>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-card mt-auto">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-form"
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                            >
                                {loading ? "Saving..." : <><FiSave /> Save changes</>}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}