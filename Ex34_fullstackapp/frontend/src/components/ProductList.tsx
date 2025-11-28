"use client";

import { useState } from "react";
import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

interface ProductListProps {
    initialProducts: Product[];
    categories: Category[];
}

export default function ProductList({ initialProducts, categories }: ProductListProps) {
    const [filterName, setFilterName] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const filteredProducts = initialProducts.filter((product) => {
        const matchesName = product.name.toLowerCase().includes(filterName.toLowerCase());
        const matchesCategory = filterCategory === "all" || product.categoryId === Number(filterCategory);

        return matchesName && matchesCategory;
    });

    return (
        <div className="space-y-8">

            <div className="flex flex-col md:flex-row gap-4 bg-card p-6 rounded-lg border border-border shadow-sm">
                <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-2">
                        Search for product
                    </label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Enter product name..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-(--color-input) border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-gray-600 transition-all"
                    />
                </div>

                <div className="w-full md:w-72">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-2">
                        Category
                    </label>
                    <div className="relative">
                        <select
                            id="category"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-4 py-2.5 bg-(--color-input) border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
                        >
                            <option value="all">All</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-card/50 rounded-lg border border-dashed border-border text-center">
                    <p className="text-xl text-foreground font-medium mb-2">No products found</p>
                        <p className="text-gray-500">Try changing your search criteria.</p>
                    <button
                        onClick={() => { setFilterName(""); setFilterCategory("all"); }}
                        className="mt-4 text-primary hover:underline text-sm"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            <div className="text-right text-xs text-gray-500 mt-4">
                Displayed {filteredProducts.length} of {initialProducts.length} products
            </div>
        </div>
    );
}