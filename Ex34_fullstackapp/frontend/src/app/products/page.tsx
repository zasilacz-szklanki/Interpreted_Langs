import { ProductAPI, CategoryAPI } from "@/lib/api";
import ProductList from "@/components/ProductList";
import { Product, Category } from "@/lib/types";

async function getData(): Promise<{ products: Product[], categories: Category[] }> {
    try {
        const [productsRes, categoriesRes] = await Promise.all([
            ProductAPI.getAll(),
            CategoryAPI.getAll()
        ]);

        return {
            products: productsRes.data.data,
            categories: categoriesRes.data.data
        };
    } catch (error) {
        console.error(error);
        return { products: [], categories: [] };
    }
}

export default async function ProductsPage() {
    const { products, categories } = await getData();

    return (
        <div className="space-y-8 p-4">
            <div className="flex flex-col gap-2 border-b border-border pb-6 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-primary">
                    Collection
                </h1>
                <p className="text-gray-400">
                    Browse our offer, filter by category and find the perfect equipment for you.
                </p>
            </div>
            <ProductList initialProducts={products} categories={categories} />
        </div>
    );
}