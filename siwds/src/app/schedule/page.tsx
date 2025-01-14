"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";


export default function SchedulePage() {
    

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
