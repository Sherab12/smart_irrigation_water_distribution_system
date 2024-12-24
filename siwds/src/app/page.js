import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
        {/* Left Section: Logo and Links */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <div className="text-lg font-bold text-blue-600">AgriFlow</div>
          {/* Navigation Links */}
          <div className="flex gap-6">
            <a href="#why" className="text-gray-600 hover:text-blue-600">Why AgriFlow</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600">About Us</a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600">FAQ</a>
          </div>
        </div>
        {/* Right Section: Login */}
        <div className="ml-auto">
          <a href="#login" className="text-gray-600 hover:text-blue-600 mr-10">Login</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight mb-4">
          Empower Your Farming Future
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6">
          Experience precision and efficiency with our smart irrigation water distribution system.
        </p>
        <p className="text-lg sm:text-xl text-gray-600 mb-6">
          Harness the power of IoT to optimize water usage and increase crop yields effortlessly.
        </p>
        <p className="text-lg text-blue-600 hover:underline cursor-pointer">
          Already have an account? Log in
        </p>
      </div>

      {/* Footer (Optional) */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        © 2024 AgriFlow. All rights reserved.
      </footer>
    </div>
  );
}