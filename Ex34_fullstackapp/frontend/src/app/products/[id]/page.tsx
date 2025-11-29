import { ProductAPI, CategoryAPI } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdminActions from "@/components/AdminActions";
import AddToCartButton from "@/components/AddToCartButton";

interface ProductPageProps {
    params: {
        id: string;
    };
}

async function getData(id: string): Promise<{ product: Product | null, categories: Category[] }> {
    try {
        const [productRes, categoriesRes] = await Promise.all([
            ProductAPI.getOne(id),
            CategoryAPI.getAll()
        ]);

        return {
            product: productRes.data.data,
            categories: categoriesRes.data.data
        };
    } catch (error) {
        console.error(error);
        return { product: null, categories: [] };
    }
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
    const { id } = await params;

    const { product, categories } = await getData(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-10">
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

                    <AdminActions product={product} categories={categories} />

                    <div className="flex flex-col gap-2 pt-4 border-t border-border">
                        <div className="text-sm text-gray-500">
                            Unit weight: {product.unitWeight} kg
                        </div>
                    </div>

                    <div className="flex gap-4 mt-auto pt-6">
                        <AddToCartButton product={product} />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-8 pt-8 border-t border-border">
                    <h2 className="text-xl font-bold text-foreground mb-4">Product Description</h2>

                    <div
                        className="prose prose-invert text-gray-400 max-w-none leading-relaxed 
                                   prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4
                                   prose-p:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-li:mb-2 prose-strong:text-primary"
                        dangerouslySetInnerHTML={{ __html: product.description || "<p>No description available.</p>" }}
                    />
                </div>
            </div>
        </div>
    );
}