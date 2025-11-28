"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthAPI } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        if (password.length < 6) {
            setError("Password has to be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            await AuthAPI.register({
                email,
                password,
                role: "CLIENT"
            });

            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);

        } catch (err: any) {
            const message = err.response?.data?.error || "Register error.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <div className="card w-full max-w-md p-8 shadow-xl border-border/50 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Registered successfully!</h2>
                    <p className="text-gray-400 mb-8">
                        Your account has been created. You can log in now.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-md transition-colors"
                    >
                        Go to log in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <div className="card w-full max-w-md p-8 shadow-xl border-border/50">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Create account</h1>
                    <p className="text-sm text-gray-400 mt-2">
                        Join TechShop and enjoy your shopping
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

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
                            placeholder="np. jessie@pinkman.pl"
                            className="w-full px-3 py-2 bg-(--color-input) border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-gray-600 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full px-3 py-2 bg-(--color-input) border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-gray-600 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat password"
                            className="w-full px-3 py-2 bg-(--color-input) border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-gray-600 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all mt-2 
              ${loading
                                ? "bg-primary/50 cursor-not-allowed"
                                : "bg-primary hover:bg-primary-hover hover:shadow-[0_0_20px_-10px_var(--color-primary)] cursor-pointer"
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </span>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Do you have account already?{" "}
                    <Link href="/login" className="text-primary hover:underline hover:text-primary-hover transition-colors">
                        Log In
                    </Link>
                </div>

            </div>
        </div>
    );
}