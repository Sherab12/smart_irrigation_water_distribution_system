"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function LogInPage() {
    const router = useRouter();
    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const onLogIn = async () => {
        console.log("Login button pressed");
        if (!user.email || !user.password) {
            console.log("Validation failed: Missing fields");
            toast.error("Both fields are required!");
            return;
        }

        console.log("Validation passed: Proceeding with login...");
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);
            console.log("Login successful:", response.data);
            toast.success("Login success");
            router.push("/profile");
        } catch (error: any) {
            console.error("Login failed:", error.message);
            toast.error(error.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-2">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                <div className="flex flex-col items-center">
                    {/* <img
                        src="/logo.png"
                        alt="AgriFlow"
                        className="w-20 h-20 mb-4"
                    /> */}
                    <h1 className="text-xl font-semibold text-blue-700 mb-2">
                        AgriFlow
                    </h1>
                </div>
                <form className="mt-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-bold text-gray-700"
                    >
                        Username or Email
                    </label>
                    <input
                        className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        id="email"
                        type="text"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        placeholder="Enter your email"
                    />
                    <label
                        htmlFor="password"
                        className="block text-sm font-bold  text-gray-700 mt-4"
                    >
                        Password
                    </label>
                    <input
                        className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        id="password"
                        type="password"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        placeholder="Enter your password"
                    />
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onLogIn();
                        }}
                        className="w-full py-2 mt-6 text-white bg-blue-400 rounded-lg hover:bg-blue-700"
                    >
                        {loading ? "Processing..." : "Login"}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <a
                        href="#"
                        className="text-sm text-blue-400 hover:underline"
                    >
                        Forgot password? Contact the Support Team
                    </a>
                </div>
                <p className="mt-2 text-center text-xs text-gray-400">
                    AgriFlow@2024 <br />
                    <a href="https://www.gsc.bt" className="hover:underline">
                        www.agriflow.bt
                    </a>
                </p>
            </div>
        </div>
    );
}
