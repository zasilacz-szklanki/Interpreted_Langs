"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthAPI } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await AuthAPI.login({
                email,
                password,
            });

            const { accessToken, refreshToken } = response.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            window.dispatchEvent(new Event("auth-change"));

            router.push("/");
            router.refresh();

        } catch (err: any) {
            const message = err.response?.data?.error || "Log in error.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <div className="card w-full max-w-md p-8 shadow-xl border-border/50">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Log In to get access to your account
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="np. walter@white.pl"
                            className="w-full px-3 py-2 bg-(--color-input) border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-gray-600 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="text-sm font-medium text-gray-300">
                                Password
                            </label>
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 bg-(--color-input) border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-gray-600 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all 
              ${loading
                                ? "bg-primary/50 cursor-not-allowed"
                                : "bg-primary hover:bg-primary-hover cursor-pointer hover:shadow-[0_0_20px_-10px_var(--color-primary)]"
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            "Log In"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account yet?{" "}
                    <Link href="/register" className="text-primary hover:underline hover:text-primary-hover transition-colors">
                        Register
                    </Link>
                </div>

            </div>
        </div>
    );
}