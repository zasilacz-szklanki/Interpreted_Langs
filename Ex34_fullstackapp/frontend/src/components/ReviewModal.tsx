"use client";

import { useState } from "react";
import { OrderAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FiStar, FiX } from "react-icons/fi";

interface ReviewModalProps {
    orderId: number;
    onClose: () => void;
}

export default function ReviewModal({ orderId, onClose }: ReviewModalProps) {
    const router = useRouter();
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await OrderAPI.addOpinion(orderId, {
                rating,
                content
            });
            alert("Thank you for your feedback!");
            onClose();
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-2xl overflow-hidden">

                <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-utility/50">
                    <h3 className="text-lg font-bold text-foreground">Rate Order #{orderId}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-2xl transition-colors ${rating >= star ? "text-yellow-400" : "text-gray-600"
                                            }`}
                                    >
                                        <FiStar fill={rating >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Your Review</label>
                            <textarea
                                rows={4}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full px-3 py-2 bg-(--color-input) border border-border rounded focus:ring-2 focus:ring-primary/50 outline-none text-foreground"
                                placeholder="Write your thoughts about the order..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit Review"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}