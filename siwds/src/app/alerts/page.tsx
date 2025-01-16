"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";


export default function AlertsPage() {

    return (
        <div className="flex">
            {/* Pass the active page to Navbar */}
            <Navbar activePage="alerts" />

            {/* Main Content */}
            <div className="flex flex-col items-center ml-56 justify-center min-h-screen w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                ALERTS PAGE
            </div>
        </div>
    );
}
