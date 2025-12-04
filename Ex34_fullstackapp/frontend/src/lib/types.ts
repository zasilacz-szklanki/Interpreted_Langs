export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    description: string | null;
    unitPrice: number;
    unitWeight: number;
    categoryId: number;
    category?: Category;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    product?: Product;
}

export interface OrderStatus {
    id: number;
    name: string;
}

export interface Order {
    id: number;
    statusId: number;
    status?: OrderStatus;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    orderItems?: OrderItem[];
    createdAt: string;
    approvedAt?: string | null;
    opinion?: Opinion | null;
}

export interface Opinion {
    id: number;
    rating: number;
    content: string;
    orderId: number;
    createdAt: string;
}

export interface User {
    id: number;
    email: string;
    role: 'CLIENT' | 'EMPLOYEE';
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    decreaseQuantity: (productId: number) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}