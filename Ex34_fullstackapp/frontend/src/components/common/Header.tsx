"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiUser, FiShoppingCart, FiMenu } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem("accessToken");
            setIsLoggedIn(!!token);
        };

        checkLoginStatus();
        window.addEventListener("auth-change", checkLoginStatus);
        window.addEventListener("storage", checkLoginStatus);

        return () => {
            window.removeEventListener("auth-change", checkLoginStatus);
            window.removeEventListener("storage", checkLoginStatus);
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth-change"));
        setIsLoggedIn(false);
        setIsDropdownOpen(false);
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="px-4 h-16 flex items-center justify-between relative">
                <div className="flex-1 flex justify-start items-center gap-4">
                    {isLoggedIn && (
                        <Link href="/cart" className="p-2 hover:text-primary transition-colors relative group">
                            <FiShoppingCart size={24} />
                            <span
                                className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full group-hover:scale-110 transition-transform">
                                0
                            </span>
                        </Link>
                    )}
                </div>

                <div className="flex-1 flex justify-center">
                    <Link href="/" className="text-2xl font-bold tracking-wider hover:opacity-80 transition-opacity">
                        SuperShop
                    </Link>
                </div>

                <div className="flex-1 flex justify-end" ref={dropdownRef}>
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 rounded-full hover:bg-utility hover:opacity-80 transition cursor-pointer focus:outline-none"
                            aria-label="Account button"
                        >
                            <FiUser size={24} className={isLoggedIn ? "text-primary" : "text-foreground"} />
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-xl overflow-hidden py-1 z-50">
                                    <div className="px-4 py-2 border-b border-border text-xs text-gray-500 uppercase tracking-wider">
                                        {isLoggedIn ? "My Account" : "Account"}
                                    </div>

                                    {isLoggedIn ? (
                                        <>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm hover:bg-utility transition-colors text-foreground"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                                            >
                                                Log Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                className="block px-4 py-2 text-sm hover:bg-utility transition-colors text-foreground"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Log In
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="block px-4 py-2 text-sm hover:bg-utility transition-colors text-foreground"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                Register
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </header>
    );
}