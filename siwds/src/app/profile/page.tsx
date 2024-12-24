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
    const [flowRate, setFlowRate] = useState(null);
    const [totalWaterFlow, setTotalWaterFlow] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/users");
                const data = await res.json();

                if (data.flowRate !== undefined && data.totalWaterFlow !== undefined) {
                    setFlowRate(data.flowRate);
                    setTotalWaterFlow(data.totalWaterFlow);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const interval = setInterval(fetchData, 2000);
        fetchData();

        return () => clearInterval(interval);
    }, []);

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
            <Navbar activePage="profile" />

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                <h1 className="text-2xl font-semibold mb-4">Profile</h1>
                <hr className="w-full mb-4" />
                <p className="mb-4">Profile page</p>
                <h2 className="mb-4">
                    {data === "nothing" ? "Nothing" : <Link href={`/profile/${data}`}>{data}</Link>}
                </h2>
                <button
                    onClick={getUserDetails}
                    className="bg-green-500 mt-4 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                    Get User Details
                </button>
                <div className="mt-6">
                    <h1 className="text-lg font-semibold">Water Flow Rate</h1>
                    <p>Flow Rate: {flowRate !== null ? `${flowRate} L/min` : "Loading..."}</p>
                    <p>Total Water Flow: {totalWaterFlow !== null ? `${totalWaterFlow.toFixed(2)} L` : "Loading..."}</p>
                </div>
            </div>
        </div>
    );
}
