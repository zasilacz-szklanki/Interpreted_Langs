"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartItem, CartContextType, Product } from "@/lib/types";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            try {
                setItems(JSON.parse(storedCart));
            } catch (e) {
                console.error(e);
            }
        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("cart", JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addToCart = (product: Product) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.product.id === product.id);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevItems, { product, quantity: 1 }];
            }
        });
    };

    const decreaseQuantity = (productId: number) => {
        setItems((prevItems) => {
            return prevItems.map((item) => {
                if (item.product.id === productId) {
                    const newQuantity = Math.max(1, item.quantity - 1);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId: number) => {
        setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + item.product.unitPrice * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                decreaseQuantity,
                removeFromCart,
                clearCart,
                cartCount,
                cartTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};