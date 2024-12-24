"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [data, setData] = useState("nothing");
    

    const logout = async () => {
        try {
            await axios.get("/api/users/logout");
            toast.success("Logout successful");
            router.push("/");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getUserDetails = async () => {
        const res = await axios.get("/api/users/me", { withCredentials: true });
        setData(res.data.data._id);
    };

    return (
        <div className="flex">
            {/* Pass the active page to Navbar */}
            <Navbar activePage="schedule" />

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                SCHEDULE PAGE
            </div>
        </div>
    );
}
