"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
    id: number;
    role: "CLIENT" | "EMPLOYEE";
    email: string;
    exp: number;
}

interface AuthContextType {
    user: TokenPayload | null;
    isEmployee: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<TokenPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkUser = () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (token) {
                const decoded = jwtDecode<TokenPayload>(token);

                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    setUser(null);
                } else {
                    setUser(decoded);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Błąd dekodowania tokena:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkUser();

        window.addEventListener("auth-change", checkUser);
        return () => window.removeEventListener("auth-change", checkUser);
    }, []);

    const isEmployee = user?.role === "EMPLOYEE";

    return (
        <AuthContext.Provider value={{ user, isEmployee, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};