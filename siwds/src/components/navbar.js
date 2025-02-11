import { FaTachometerAlt, FaCalendarAlt, FaCogs, FaChartLine, FaBell, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

const Navbar = ({ activePage }) => {
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

    // Function to determine the active page style
    const isActive = (page) => activePage === page ? "bg-blue-800 text-white" : "hover:bg-blue-800 hover:text-white";

    return (
        <nav className="bg-white-gray-800 w-64 fixed h-screen p-4 rounded-sm">
            <h1 className="text-xl font-bold mb-4 text-blue-800">AgriFlow</h1>
            <ul>
                <li className="mb-2">
                    <button
                        onClick={() => router.push("/profile")}
                        className={`flex text-sm items-center px-4 py-2 rounded-sm transition duration-200 w-44 text-left ${isActive('profile')}`}
                    >
                        <FaTachometerAlt className={`mr-2 ${activePage === 'profile' ? 'text-white' : 'text-blue-400'}`} /> Dashboard
                    </button>
                </li>
                <li className="mb-2">
                    <button
                        onClick={() => router.push("/schedule")}
                        className={`flex text-sm items-center px-4 py-2 rounded-sm transition duration-200 w-44 text-left ${isActive('schedule')}`}
                    >
                        <FaCalendarAlt className={`mr-2 ${activePage === 'schedule' ? 'text-white' : 'text-blue-400'}`} /> Schedule
                    </button>
                </li>
                <li className="mb-2">
                    <button
                        onClick={() => router.push("/devices")}
                        className={`flex text-sm items-center px-4 py-2 rounded-sm transition duration-200 w-44 text-left ${isActive('devices')}`}
                    >
                        <FaCogs className={`mr-2 ${activePage === 'devices' ? 'text-white' : 'text-blue-400'}`} /> Devices
                    </button>
                </li>
                <li className="mb-2">
                    <button
                        onClick={() => router.push("/analysis")}
                        className={`flex text-sm items-center px-4 py-2 rounded-sm transition duration-200 w-44 text-left ${isActive('analysis')}`}
                    >
                        <FaChartLine className={`mr-2 ${activePage === 'analysis' ? 'text-white' : 'text-blue-400'}`} /> Analysis
                    </button>
                </li>
                <li className="mb-2">
                    <button
                        onClick={() => router.push("/alerts")}
                        className={`flex text-sm items-center px-4 py-2 rounded-sm transition duration-200 w-44 text-left ${isActive('alerts')}`}
                    >
                        <FaBell className={`mr-2 ${activePage === 'alerts' ? 'text-white' : 'text-blue-400'}`} /> Alerts
                    </button>
                </li>
                <li className="mb-2">
                    <button
                        onClick={() => router.push("/settings")}
                        className={`flex text-sm items-center px-4 py-2 rounded-sm transition duration-200 w-44 text-left ${isActive('settings')}`}
                    >
                        <FaCogs className={`mr-2 ${activePage === 'settings' ? 'text-white' : 'text-blue-400'}`} /> Settings
                    </button>
                </li>
                <li className="mb-2">
                    <button
                        onClick={() => setShowModal(true)} // Show logout confirmation modal
                        className="flex text-sm items-center px-4 py-2 rounded-sm hover:bg-blue-800 hover:text-white transition duration-200 w-44 text-left"
                    >
                        <FaSignOutAlt className="mr-2 text-blue-400" /> Log Out
                    </button>
                </li>
            </ul>

            {/* Logout Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"> 
                    <div className="bg-white rounded-md shadow-lg p-6 w-96 z-50"> 
                        <h2 className="text-xl text-center font-bold mb-4">Are you sure?</h2>
                        <p className="mb-4 text-center">Do you want to log out?</p>
                        <div className="flex justify-center space-x-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-400 text-white text-center py-2 px-4 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
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
