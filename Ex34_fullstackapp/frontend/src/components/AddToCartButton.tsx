"use client";

import { useCart } from "@/providers/CartProvider";
import { Product } from "@/lib/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    product: Product;
    small?: boolean; // Nowy prop
}

export default function AddToCartButton({ product, small = false }: Props) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const router = useRouter();

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();

        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.push("/login");
            return;
        }

        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const paddingClass = small ? "py-2 px-3 text-sm" : "py-4 px-6";

    return (
        <button
            onClick={handleAdd}
            disabled={isAdded}
            className={`flex-1 font-semibold rounded-lg transition-all w-full cursor-pointer
        ${paddingClass}
        ${isAdded
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-primary hover:bg-primary-hover text-white hover:shadow-[0_0_20px_-5px_var(--color-primary)]"
                }`}
        >
            {isAdded ? (small ? "Added!" : "Added to cart! ✓") : (small ? "Add" : "Add to cart")}
        </button>
    );
}