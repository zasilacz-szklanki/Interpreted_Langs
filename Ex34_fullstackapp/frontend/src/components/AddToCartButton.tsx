"use client";

import { useCart } from "@/providers/CartProvider";
import { Product } from "@/lib/types";
import { useState } from "react";

export default function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = () => {
        addToCart(product);

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <button
            onClick={handleAdd}
            disabled={isAdded}
            className={`flex-1 font-semibold py-4 px-6 rounded-lg transition-all cursor-pointer 
        ${isAdded
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-primary hover:bg-primary-hover text-white hover:shadow-[0_0_20px_-5px_var(--color-primary)]"
                }`}
        >
            {isAdded ? "In cart! ✓" : "Add to cart"}
        </button>
    );
}