"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { InitAPI } from "@/lib/api";
import Link from "next/link";
import { FiUpload, FiCheckCircle, FiAlertTriangle, FiFileText, FiArrowLeft } from "react-icons/fi";

interface ImportItem {
    name: any;
    description: any;
    unitPrice: any;
    unitWeight: any;
    categoryId: any;
}

export default function DatabaseInitPage() {
    const { isEmployee, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [validationStats, setValidationStats] = useState<{ total: number } | null>(null);

    useEffect(() => {
        if (!authLoading && !isEmployee) {
            router.push("/");
        }
    }, [isEmployee, authLoading, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccess(null);
            setValidationStats(null);
        }
    };

    const validateContent = (data: any[]): string | null => {
        if (!Array.isArray(data)) {
            return "The JSON file must contain an array of objects (start with '[').";
        }

        if (data.length === 0) {
            return "The array in the file is empty.";
        }

        for (let i = 0; i < data.length; i++) {
            const item = data[i] as ImportItem;
            const index = i + 1;

            if (!item.name || typeof item.name !== 'string') return `Item #${index}: Missing valid product name.`;
            if (!item.description || typeof item.description !== 'string') return `Item #${index}: Missing valid description.`;

            if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) return `Item #${index} ("${item.name}"): Price must be a number greater than 0.`;
            if (typeof item.unitWeight !== 'number' || item.unitWeight <= 0) return `Item #${index} ("${item.name}"): Weight must be a number greater than 0.`;
            if (typeof item.categoryId !== 'number') return `Item #${index} ("${item.name}"): Category ID must be a number.`;
        }

        return null;
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;

                let parsedData;
                try {
                    parsedData = JSON.parse(text);
                } catch (jsonError) {
                    throw new Error("Invalid JSON file format. Check syntax.");
                }

                const validationError = validateContent(parsedData);
                if (validationError) {
                    throw new Error(validationError);
                }

                setValidationStats({ total: parsedData.length });

                const response = await InitAPI.initializeDatabase(parsedData);

                setSuccess(`Success! Imported ${response.data.count} products.`);
                setFile(null);

            } catch (err: any) {
                console.error(err);

                if (err.response) {
                    const status = err.response.status;
                    const msg = err.response.data?.error || "Server error.";

                    if (status === 409) {
                        setError("Error: Database is not empty. Initialization blocked.");
                    } else if (status === 403) {
                        setError("Insufficient permissions to perform this operation.");
                    } else {
                        setError(`Server error: ${msg}`);
                    }
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        reader.readAsText(file);
    };

    if (authLoading) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8 my-5">

            <div className="flex items-center gap-4">
                <div>
                    <Link href="/admin" className="text-sm text-gray-400 hover:text-primary transition-colors mb-2 block">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Database Initialization</h1>
                    <p className="text-gray-400">Import products from JSON file (only for empty database)</p>
                </div>
            </div>

            <div className="card p-8 border border-border bg-card shadow-lg">

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
                        <FiAlertTriangle size={24} className="shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold">Error Occurred</h3>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
                        <FiCheckCircle size={24} className="shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold">Operation Successful</h3>
                            <p className="text-sm opacity-90">{success}</p>
                        </div>
                    </div>
                )}

                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors bg-(--color-input)/30">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />

                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-utility rounded-full flex items-center justify-center text-primary">
                            {file ? <FiFileText size={32} /> : <FiUpload size={32} />}
                        </div>

                        <div>
                            {file ? (
                                <>
                                    <p className="text-lg font-medium text-foreground">{file.name}</p>
                                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-lg font-medium text-gray-300">Click to select file</p>
                                    <p className="text-sm text-gray-500">Supported format: .JSON</p>
                                </>
                            )}
                        </div>
                    </label>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer"
                    >
                        {loading ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <FiUpload /> Initialize Database
                            </>
                        )}
                    </button>
                </div>

            </div>

            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm text-blue-300">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                    ℹ️ Required JSON file format:
                </h4>
                <pre className="bg-black/30 p-3 rounded overflow-x-auto font-mono text-xs">
                    {`[
  {
    "name": "Product Name",
    "description": "Description...",
    "unitPrice": 99.99,
    "unitWeight": 1.5,
    "categoryId": 1
  },
  ...
]`}
                </pre>
            </div>

        </div>
    );
}