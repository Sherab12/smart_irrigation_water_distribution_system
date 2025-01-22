"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/navbar";

// Validation Modal Component
const ValidationModal = ({ show, onClose }: { show: boolean, onClose: () => void }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-lg text-center font-semibold">Validation Error</h2>
                <p className="mt-2 text-center">Please make sure all required fields are filled out before submitting.</p>
                <div className=" text-center">
                    <button onClick={onClose} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
                        OK
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default function DevicePage() {
    const [sources, setSources] = useState<Record<string, { flowSensors: string[]; pressureSensors: string[]; valves: string[] }>>({});
    const [newSource, setNewSource] = useState<string>("");
    const [newFlowSensors, setNewFlowSensors] = useState<string>("");
    const [newPressureSensors, setNewPressureSensors] = useState<string>("");
    const [newValves, setNewValves] = useState<string>("");
    const [selectedSource, setSelectedSource] = useState<string>("");
    const [selectedSensorType, setSelectedSensorType] = useState<string>("flowSensors");
    const [selectedSensor, setSelectedSensor] = useState<string>("");
    const [sensorData, setSensorData] = useState<any>(null); // Use any or define a more general type
    const [showValidationModal, setShowValidationModal] = useState(false); // Validation modal visibility state
    const [fieldSource, setFieldSource] = useState<string>("");
    const [fieldName, setFieldName] = useState<string>("");
    const [fieldSize, setFieldSize] = useState<string>("");
    const [selectedFlowSensor, setSelectedFlowSensor] = useState<string>("");
    const [autoSelectedValve, setAutoSelectedValve] = useState<string>("");

    // Fetch sources on component mount
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const response = await axios.get("/api/source"); // Update with correct endpoint
                if (response.status === 200) {
                    setSources(response.data);
                } else {
                    toast.error("Failed to fetch sources");
                }
            } catch (error) {
                toast.error("Failed to fetch sources");
                console.error("Error fetching sources:", error);
            }
        };

        fetchSources();
    }, []);

    useEffect(() => {
        if (fieldSource && selectedFlowSensor) {
            const flowIndex = sources[fieldSource]?.flowSensors.indexOf(selectedFlowSensor);
            if (flowIndex !== -1) {
                setAutoSelectedValve(sources[fieldSource]?.valves[flowIndex] || "");
            } else {
                setAutoSelectedValve("");
            }
        }
    }, [fieldSource, selectedFlowSensor, sources]);
    


    // Add field details
    const addFieldDetails = async () => {
        console.log("Field Name:", fieldName);
        console.log("Field Size:", fieldSize);
        console.log("Flow Sensor:", selectedFlowSensor); // Debugging
        console.log("Valve:", autoSelectedValve); // Debugging
        console.log("Source:", fieldSource);
    
        // Validation check for required fields
        if (!fieldName || !fieldSize || !selectedFlowSensor || !autoSelectedValve || !fieldSource) {
            setShowValidationModal(true);
            return;
        }
    
        try {
            // Post the data to the server
            const response = await axios.post("/api/field", {
                fieldName,
                fieldSize,
                flowSensor: selectedFlowSensor,
                valve: autoSelectedValve,
                source: fieldSource,
            });
    
            if (response.data.success) {
                toast.success(response.data.message);
                // Reset form fields after successful submission
                setFieldName("");
                setFieldSize("");
                setSelectedFlowSensor("");
                setAutoSelectedValve("");
                setFieldSource("");
            } else {
                toast.error(response.data.error || "Failed to add field details");
            }
        } catch (error) {
            toast.error("Failed to add field details");
            console.error("Error adding field details:", error);
        }
    };
    

    // Fetch sensor data
    const fetchSensorData = async () => {
        if (!selectedSource || !selectedSensor) {
            toast.error("Please select a source and sensor");
            return;
        }

        try {
            const response = await axios.get(`/api/source?source=${selectedSource}&sensorType=${selectedSensorType}&sensor=${selectedSensor}`);

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
        // Validate required fields before proceeding
        if (!newSource || (!newFlowSensors && !newPressureSensors && !newValves)) {
            setShowValidationModal(true); // Show the validation modal
            return;
        }

        const flowSensors = newFlowSensors.split(",").map((s) => s.trim()).filter(Boolean);
        const pressureSensors = newPressureSensors.split(",").map((s) => s.trim()).filter(Boolean);
        const valves = newValves.split(",").map((s) => s.trim()).filter(Boolean);

        try {
            const response = await axios.post("/api/source", {
                sourceName: newSource,
                flowSensors,
                pressureSensors,
                valves,
            });

            if (response.data.success) {
                toast.success(response.data.message);

                // Update the local sources state
                setSources((prevSources) => ({
                    ...prevSources,
                    [newSource]: { flowSensors, pressureSensors, valves },
                }));

                // Reset input fields
                setNewSource("");
                setNewFlowSensors("");
                setNewPressureSensors("");
                setNewValves("");
            } else {
                toast.error(response.data.error || "Failed to add source and sensors");
            }
        } catch (error) {
            toast.error("Failed to add source and sensors");
            console.error("Error adding source and sensors:", error);
        }
    };

    // Close the validation modal
    const closeValidationModal = () => {
        setShowValidationModal(false);
    };

    return (
        <div className="flex">
            <Navbar activePage="devices" />

            <div className="flex flex-col w-full p-6 ml-56 bg-gray-50 min-h-screen shadow-lg rounded-md m-4">
                

                {/* Add Source and Sensors */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Add New Source and Sensors</h2>
                    <input
                        type="text"
                        placeholder="(source1, source2, ... )"
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <input
                        type="text"
                        placeholder="( flow1, flow2, flow3, ... )"
                        value={newFlowSensors}
                        onChange={(e) => setNewFlowSensors(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <input
                        type="text"
                        placeholder="( pressure1, pressure2, ... )"
                        value={newPressureSensors}
                        onChange={(e) => setNewPressureSensors(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <input
                        type="text"
                        placeholder="( valve1, valve2, valve3, ...)"
                        value={newValves}
                        onChange={(e) => setNewValves(e.target.value)}
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <button onClick={addSource} className="p-2 bg-blue-500 mt-4 text-white rounded">
                        Add Source
                    </button>
                </div>


        {/* Add Field Details Section */}
        <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Add Field Details</h2>

            {/* Field Name, Size, and Source */}
            <div className="flex items-center mb-4 space-x-2">
                <input
                    type="text"
                    placeholder="Field Name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    placeholder="Field Size (in km2)"
                    value={fieldSize}
                    onChange={(e) => setFieldSize(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                />
                <select
                    value={fieldSource}
                    onChange={(e) => setFieldSource(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                >
                    <option value="">Select Source</option>
                    {Object.keys(sources).map((source) => (
                        <option key={source} value={source}>
                            {source}
                        </option>
                    ))}
                </select>
            </div>

            {/* Flow Sensor and Valve */}
            {fieldSource && (
                <div className="flex items-center space-x-2 mb-4">
                    <select
                        value={selectedFlowSensor}
                        onChange={(e) => setSelectedFlowSensor(e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                    >
                        <option value="">Select Flow Sensor</option>
                        {sources[fieldSource]?.flowSensors.map((sensor, index) => (
                            <option key={index} value={sensor}>
                                {sensor}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Valve"
                        value={
                            sources[fieldSource]?.valves[
                                sources[fieldSource]?.flowSensors.indexOf(selectedFlowSensor)
                            ] || ""
                        }
                        readOnly
                        className="p-2 border border-gray-300 rounded bg-gray-100"
                    />
                </div>
            )}

            <button onClick={addFieldDetails} className="p-2 bg-blue-500 text-white rounded">
                Add Field
            </button>
        </div>

                {/* Select Source and Sensor */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Fetch Sensor Data</h2>
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
                        <h3 className="text-lg font-semibold mb-2">Sensor Data</h3>

                        {/* Handle flow sensor data */}
                        {sensorData.flowRate !== undefined && (
                            <div>
                                <p>Flow Rate: {sensorData.flowRate}</p>
                                <p>Total Water Flow: {sensorData.totalWaterFlow}</p>
                            </div>
                        )}

                        {/* Handle pressure sensor data */}
                        {sensorData.pressure !== undefined && (
                            <div>
                                <p>Pressure: {sensorData.pressure}</p>
                            </div>
                        )}

                        {/* Handle valve data */}
                        {sensorData.state !== undefined && (
                            <div>
                                <p>Valve State: {sensorData.state}</p>
                                <p>Percentage Open: {sensorData.percentageOpen}%</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Validation Modal */}
            <ValidationModal show={showValidationModal} onClose={closeValidationModal} />
        </div>
    );
} 