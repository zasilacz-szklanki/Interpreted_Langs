import { ProductAPI } from "@/lib/api";
import { Product } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProductPageProps {
    params: {
        id: string;
    };
}

async function getProduct(id: string): Promise<Product | null> {
    try {
        const response = await ProductAPI.getOne(id);
        return response.data.data;
    } catch (error) {
        return null;
    }
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
    const { id } = await params;

    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 min-h-[calc(100vh-5rem)] pt-10">
            <Link href="/products" className="text-sm text-gray-400 hover:text-primary transition-colors">
                &larr; Back to product list
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                <div className="aspect-square bg-utility rounded-lg flex items-center justify-center text-gray-500 text-lg border border-border">
                    Photo: {product.name}
                </div>

                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                        <p className="text-primary font-medium mt-1">{product.category?.name}</p>
                    </div>

                    <div className="text-2xl font-bold text-foreground">
                        {product.unitPrice.toFixed(2)} PLN
                    </div>

                    <div className="prose prose-invert text-gray-400 leading-relaxed">
                        <p>{product.description || "Brak opisu dla tego produktu."}</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-border">
                        <div className="text-sm text-gray-500">
                            Unit weight: {product.unitWeight} kg
                        </div>
                    </div>

                    <div className="flex gap-4 mt-auto pt-6">
                        <button className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-4 px-6 rounded-lg transition-all hover:shadow-[0_0_20px_-5px_var(--color-primary)]">
                            Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}