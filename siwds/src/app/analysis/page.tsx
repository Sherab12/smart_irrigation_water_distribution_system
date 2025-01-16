"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Link from "next/link";

export default function AnalysisPage() {

    return (
        <div className="flex">
            {/* Pass the active page to Navbar */}
            <Navbar activePage="analysis" />

            {/* Main Content */}
            <div className="flex flex-col ml-56 items-center justify-center min-h-screen w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                ANAYSIS PAGE
            </div>
        </div>
    );
}
