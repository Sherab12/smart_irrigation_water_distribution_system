import Link from "next/link"; 
import { FaTachometerAlt, FaCalendarAlt, FaCogs, FaChartLine, FaBell, FaSignOutAlt } from "react-icons/fa"; 
import { useState } from "react"; 
import axios from "axios"; 
import { useRouter } from "next/navigation"; 
import toast from "react-hot-toast";

const Navbar = () => { 
    const [showModal, setShowModal] = useState(false); // State to toggle modal visibility 
    const router = useRouter();

    const handleLogout = async () => { 
        try { 
            await axios.get("/api/users/logout"); 
            toast.success("Logout successful"); 
            router.push("/"); 
        } catch (error) { 
            toast.error("Error during logout"); 
        } 
    };

    return (
        <nav className="bg-white-gray-800 w-64 h-screen p-4 rounded-sm">
            <h1 className="text-xl font-bold mb-4 text-blue-800">AgriFlow</h1>
            <ul>
                <li className="mb-2">
                    <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 rounded-sm hover:bg-blue-800 hover:text-white transition duration-200"
                    >
                        {/* Make sure hover affects both text and icon */}
                        <FaTachometerAlt className="mr-2 text-blue-400" /> Dashboard
                    </Link>
                </li>
                <li className="mb-2">
                    <Link
                        href="/schedule"
                        className="flex items-center px-4 py-2 rounded-sm hover:bg-blue-800 hover:text-white transition duration-200"
                    >
                        <FaCalendarAlt className="mr-2 text-blue-400" /> Schedule
                    </Link>
                </li>
                <li className="mb-2">
                    <Link
                        href="/devices"
                        className="flex items-center px-4 py-2 rounded-sm hover:bg-blue-800 hover:text-white transition duration-200"
                    >
                        <FaCogs className="mr-2 text-blue-400" /> Devices
                    </Link>
                </li>
                <li className="mb-2">
                    <Link
                        href="/analysis"
                        className="flex items-center px-4 py-2 rounded-sm hover:bg-blue-800 hover:text-white transition duration-200"
                    >
                        <FaChartLine className="mr-2 text-blue-400" /> Analysis
                    </Link>
                </li>
                <li className="mb-2">
                    <Link
                        href="/alerts"
                        className="flex items-center px-4 py-2 rounded-sm hover:bg-blue-800 hover:text-white transition duration-200"
                    >
                        <FaBell className="mr-2 text-blue-400 " /> Alerts
                    </Link>
                </li>
                <li className="mb-2">
                    <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 rounded-sm hover:bg-blue-800 hover:text-white transition duration-200"
                    >
                        <FaCogs className="mr-2 text-blue-400 " /> Settings
                    </Link>
                </li>
                <li className="mb-2">
                    <button
                        onClick={() => setShowModal(true)} // Show logout confirmation modal
                        className="flex items-center px-4 py-2 rounded-sm hover:bg-blue-800 hover:text-white transition duration-200 w-full text-left"
                    >
                        <FaSignOutAlt className="mr-2 text-blue-400 " /> Log Out
                    </button>
                </li>
            </ul>

            {/* Logout Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-md shadow-lg p-6 w-96">
                        <h2 className="text-xl text-center font-bold mb-4">Are you sure?</h2>
                        <p className="mb-4 text-center">Do you want to log out?</p>
                        <div className="flex justify-center space-x-6">
                            <button
                                onClick={() => setShowModal(false)} // Close modal
                                className="bg-gray-500 text-white text-center py-2 px-4 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout} // Proceed with logout
                                className="bg-red-500 text-white text-center py-2 px-4 rounded hover:bg-red-600"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
