"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [data, setData] = useState("nothing");

    const [flowRate, setFlowRate] = useState(null);
    const [totalWaterFlow, setTotalWaterFlow] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch('/api/users');  // Fetch flow rate from the API
            const data = await res.json();
            console.log("Fetched data:", data);  // Log the response for debugging

            // Check if data contains flowRate and totalWaterFlow
            if (data.flowRate !== undefined && data.totalWaterFlow !== undefined) {
            setFlowRate(data.flowRate);  // Set flow rate state
            setTotalWaterFlow(data.totalWaterFlow);  // Set total water flow state
            } else {
            console.error("Data format error:", data);  // Log if the data format is wrong
            }
        } catch (error) {
            console.error("Error fetching data:", error);  // Log any fetch errors
        }
        };

        // Fetch data every 2 seconds
        const interval = setInterval(fetchData, 2000);
        fetchData(); // Initial fetch

        return () => clearInterval(interval);  // Cleanup on component unmount
    }, []);

    const logout = async () => {
        try {
        await axios.get('/api/users/logout');
        toast.success('Logout successful');
        router.push('/login');
        } catch (error) {
        console.log(error.message);
        toast.error(error.msg);
        }
    };

    const getUserDetails = async () => {
        const res = await axios.get('/api/users/me', { withCredentials: true });
        console.log(res.data);
        setData(res.data.data._id);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1>Profile</h1>
        <hr />
        <p>Profile page</p>
        <h2>{data === 'nothing' ? "Nothing" : <Link href={`/profile/${data}`}>{data}</Link>}</h2>
        <hr />
        <button
            onClick={logout}
            className="bg-blue-500 mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            Logout
        </button>
        <button
            onClick={getUserDetails}
            className="bg-green-800 mt-4 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
            Get User Details
        </button>
        <h1>Water Flow Rate</h1>
        <p>Flow Rate: {flowRate !== null ? `${flowRate} L/min` : 'Loading...'}</p>
        <p>Total Water Flow: {totalWaterFlow !== null ? `${totalWaterFlow.toFixed(2)} L` : 'Loading...'}</p>
        </div>
    );
}
