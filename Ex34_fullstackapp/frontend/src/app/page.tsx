import Link from "next/link";

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center space-y-10 relative overflow-hidden">
            <div className="space-y-6 max-w-3xl px-4 z-10">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                    Welcome to <span className="text-primary">SuperShop</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Your premium destination for everyday essentials and modern lifestyle products.
                    Upgrade your routine today with our carefully curated collection.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 z-10">
                <Link
                    href="/products"
                    className="bg-primary hover:bg-primary-hover text-white text-lg font-semibold px-8 py-4 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_var(--color-primary)]"
                >
                    Browse Collection
                </Link>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] z-0 pointer-events-none" />

        </div>
    );
}