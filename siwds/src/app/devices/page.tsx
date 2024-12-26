"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/navbar";

// Validation Modal Component
const ValidationModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white rounded-md shadow-lg p-6 w-96">
                <h2 className="text-xl text-center font-bold mb-4">Error</h2>
                <p className="mb-4 text-center">Please make sure all required fields are filled</p>
                <div className="flex justify-center space-x-6">
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white text-center py-2 px-4 rounded hover:bg-red-600"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function DevicePage() {
    const [sources, setSources] = useState<
        Record<string, { flowSensors: string[]; pressureSensors: string[]; valves: string[] }>
    >({});
    const [newSource, setNewSource] = useState<string>("");
    const [newFlowSensors, setNewFlowSensors] = useState<string>("");
    const [newPressureSensors, setNewPressureSensors] = useState<string>("");
    const [newValves, setNewValves] = useState<string>("");
    const [selectedSource, setSelectedSource] = useState<string>("");
    const [selectedSensorType, setSelectedSensorType] = useState<string>("flowSensors");
    const [selectedSensor, setSelectedSensor] = useState<string>("");
    const [sensorData, setSensorData] = useState<any>(null); // Sensor data state
    const [showValidationModal, setShowValidationModal] = useState(false);

    // Fetch sources on mount
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const response = await axios.get("/api/users"); // Replace with your endpoint
                if (response.status === 200) {
                    setSources(response.data);
                } else {
                    toast.error("Failed to fetch sources");
                }
            } catch (error) {
                console.error("Error fetching sources:", error);
                toast.error("Failed to fetch sources");
            }
        };
        fetchSources();
    }, []);

    // Fetch sensor data from the MQTT broker (simulated)
    const fetchSensorData = async () => {
    if (!selectedSource || !selectedSensor) {
        toast.error("Please select a source and sensor");
        return;
    }

    try {
        const response = await axios.get(`/api/users?source=${selectedSource}&sensor=${selectedSensor}`);
        if (response.status === 200) {
            setSensorData(response.data);
            toast.success("Sensor data fetched successfully");
        } else {
            toast.error(response.data.error || "Failed to fetch sensor data");
        }
    } catch (error) {
        toast.error("Failed to fetch sensor data");
        console.error("Error fetching sensor data:", error);
    }
};

    

    // Add new source and sensors
    const addSource = async () => {
        if (!newSource || !newFlowSensors) {
            setShowValidationModal(true);
            return;
        }
    
        const flowSensors = newFlowSensors.split(',').map((s) => s.trim()).filter(Boolean);
    
        try {
            // Add the source and sensors to the database
            const response = await axios.post('/api/users', {
                sourceName: newSource,
                flowSensors,
            });
    
            if (response.data.success) {
                toast.success(response.data.message);
    
                // Subscribe to MQTT topics for the new flow sensors
                for (const flowSensor of flowSensors) {
                    await axios.post('/api/devices/subscribe', {
                        sourceName: newSource,
                        flowSensorName: flowSensor,
                    });
                }
    
                // Update the local sources state
                setSources((prevSources) => ({
                    ...prevSources,
                    [newSource]: { flowSensors, pressureSensors: [], valves: [] },
                }));
    
                // Reset input fields
                setNewSource('');
                setNewFlowSensors('');
            } else {
                toast.error(response.data.error || 'Failed to add source and sensors');
            }
        } catch (error) {
            toast.error('Failed to add source and sensors');
            console.error('Error adding source and sensors:', error);
        }
    };
    

    // Close validation modal
    const closeValidationModal = () => setShowValidationModal(false);

    return (
        <div className="flex">
            <Navbar activePage="devices" />

            <div className="flex flex-col w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                {/* Add Source and Sensors */}
                <div className="mb-6">
                    <h2 className="text-base font-bold mb-2">Add New Source and Sensors</h2>
                    <input
                        type="text"
                        placeholder="Source Name"
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <input
                        type="text"
                        placeholder="Flow Sensors (comma-separated)"
                        value={newFlowSensors}
                        onChange={(e) => setNewFlowSensors(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <input
                        type="text"
                        placeholder="Pressure Sensors (comma-separated)"
                        value={newPressureSensors}
                        onChange={(e) => setNewPressureSensors(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <input
                        type="text"
                        placeholder="Valves (comma-separated)"
                        value={newValves}
                        onChange={(e) => setNewValves(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <button onClick={addSource} className="p-2 bg-green-500 text-white rounded">
                        Add Source
                    </button>
                </div>

                {/* Select Source and Sensor */}
                <div className="mb-6">
                    <h2 className="text-base font-bold mb-2">Select Source and Sensor</h2>
                    <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    >
                        <option value="">Select Source</option>
                        {Object.keys(sources).map((source) => (
                            <option key={source} value={source}>
                                {source}
                            </option>
                        ))}
                    </select>

                    {selectedSource && (
                        <>
                            <select
                                value={selectedSensorType}
                                onChange={(e) => setSelectedSensorType(e.target.value)}
                                className="p-2 border border-gray-300 rounded mr-2"
                            >
                                <option value="flowSensors">Flow Sensors</option>
                                <option value="pressureSensors">Pressure Sensors</option>
                                <option value="valves">Valves</option>
                            </select>
                            <select
                                value={selectedSensor}
                                onChange={(e) => setSelectedSensor(e.target.value)}
                                className="p-2 border border-gray-300 rounded mr-2"
                            >
                                <option value="">Select Sensor</option>
                                {sources[selectedSource]?.[selectedSensorType]?.map((sensor) => (
                                    <option key={sensor} value={sensor}>
                                        {sensor}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                    <button onClick={fetchSensorData} className="p-2 bg-green-500 text-white rounded">
                        Fetch Data
                    </button>
                </div>

                {/* Display Sensor Data */}
                {sensorData && (
                    <div className="p-4 bg-white shadow rounded">
                        <h3 className="text-base font-bold mb-2">Sensor Data</h3>
                        <pre>{JSON.stringify(sensorData, null, 2)}</pre>
                    </div>
                )}

            </div>

            {/* Validation Modal */}
            <ValidationModal show={showValidationModal} onClose={closeValidationModal} />
        </div>
    );
}
