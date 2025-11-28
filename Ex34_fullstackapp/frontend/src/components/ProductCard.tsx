import Link from "next/link";
import { Product } from "@/lib/types";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className="card group flex flex-col overflow-hidden transition-all hover:border-primary/50 h-full">

            <div className="aspect-square w-full bg-utility flex items-center justify-center text-gray-500 group-hover:bg-[#27272a] transition-colors relative">
                <span className="text-sm">Photo</span>
                <span className="absolute top-2 right-2 bg-background/80 text-[10px] px-2 py-1 rounded text-gray-400">
                    {product.category?.name}
                </span>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-start">
                    <h2 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                    </h2>
                    <span className="font-bold text-foreground whitespace-nowrap ml-2">
                        {product.unitPrice.toFixed(2)} PLN
                    </span>
                </div>

                <p className="text-sm text-gray-400 line-clamp-2 flex-1">
                    {product.description}
                </p>

                <div className="mt-4 flex gap-2">
                    <Link
                        href={`/products/${product.id}`}
                        className="flex-1 text-center text-sm font-medium py-2 px-4 rounded bg-utility hover:bg-secondary-hover transition-colors"
                    >
                        Details
                    </Link>
                    <button className="flex-1 text-sm font-medium py-2 px-4 rounded bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">
                        Add to cart
                    </button>
                </div>
            </div>
        </div>
    );
}