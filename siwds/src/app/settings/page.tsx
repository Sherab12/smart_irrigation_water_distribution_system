"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";
import Link from "next/link";

export default function SettingsPage() {

    return (
        <div className="flex">
            {/* Pass the active page to Navbar */}
            <Navbar activePage="settings" />

            {/* Main Content */}
            <div className="flex flex-col ml-56 items-center min-h-screen justify-center w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                SETTINGS PAGE
            </div>
        </div>
    );
}
