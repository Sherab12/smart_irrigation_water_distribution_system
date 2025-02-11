"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/navbar";

interface Field {
    _id: any;
    fieldName: string;
    fieldSize: string;
    flowSensor: string;
    valve: string;
    source: string;
}

interface Source {
    name: string;
    flowSensors: { name: string; flowRate: number; totalWaterFlow: number }[];
    pressureSensors: { name: string; pressure: number }[];
    valves: { name: string; state: string; percentageOpen: number }[];
}

export default function SettingsPage() {
    const [fields, setFields] = useState<Field[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [selectedTab, setSelectedTab] = useState<'field' | 'source'>('field');



    useEffect(() => {
        const fetchData = async () => {
            try {
                const fieldResponse = await axios.get("/api/field");
                const sourceResponse = await axios.get("/api/source");
                
                setFields(fieldResponse.data.data as Field[]);
                const sourcesArray = Object.keys(sourceResponse.data).map((key) => {
                    const source = sourceResponse.data[key];
                    return {
                        name: key,
                        flowSensors: source.flowSensors.map((sensor: { totalWaterFlow: any; }) =>
                            typeof sensor === "string"
                                ? { name: sensor, flowRate: 0, totalWaterFlow: 0 }
                                : { ...sensor, totalWaterFlow: sensor.totalWaterFlow ?? 0 }
                        ),
                        pressureSensors: source.pressureSensors.map((sensor: any) =>
                            typeof sensor === "string" ? { name: sensor, pressure: 0 } : sensor
                        ),
                        valves: source.valves.map((valve: any) =>
                            typeof valve === "string" ? { name: valve, state: "closed", percentageOpen: 0 } : valve
                        ),
                    };
                });
                setSources(sourcesArray);
            } catch (error) {
                toast.error("Error fetching data.");
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (sourceName: string, sensorName: string, type: string) => {
        try {
            const response = await axios.delete("/api/source", {
                data: { sourceName, sensorName, type }
            });
            if (response.data.success) {
                toast.success("Deleted successfully");
                setSources(prevSources => prevSources.map(src => 
                    src.name === sourceName 
                        ? {
                            ...src,
                            flowSensors: type === "Flow Sensor" ? src.flowSensors.filter(s => s.name !== sensorName) : src.flowSensors,
                            pressureSensors: type === "Pressure Sensor" ? src.pressureSensors.filter(s => s.name !== sensorName) : src.pressureSensors,
                            valves: type === "Valve" ? src.valves.filter(v => v.name !== sensorName) : src.valves
                        }
                        : src
                ));
            }
        } catch (error) {
            toast.error("Failed to delete");
            console.error(error);
        }
    };

    const [sourceDeleteConfirmation, setSourceDeleteConfirmation] = useState<{ 
        show: boolean; 
        sourceName: string | null; 
        sensorName: string | null; 
        type: string | null 
    }>({ show: false, sourceName: null, sensorName: null, type: null });
    
    const confirmSourceDelete = (sourceName: string, sensorName: string, type: string) => {
        setSourceDeleteConfirmation({ show: true, sourceName, sensorName, type });
    };
    
    const closeSourceDeleteModal = () => {
        setSourceDeleteConfirmation({ show: false, sourceName: null, sensorName: null, type: null });
    };
    
    const handleConfirmSourceDelete = async () => {
        if (!sourceDeleteConfirmation.sourceName || !sourceDeleteConfirmation.sensorName || !sourceDeleteConfirmation.type) return;
    
        await handleDelete(sourceDeleteConfirmation.sourceName, sourceDeleteConfirmation.sensorName, sourceDeleteConfirmation.type);
        closeSourceDeleteModal();
    };
    

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; fieldId: any }>(
        { show: false, fieldId: null }
    );
    
    const confirmDelete = (fieldId: any) => {
        setDeleteConfirmation({ show: true, fieldId });
    };
    
    const closeModal = () => {
        setDeleteConfirmation({ show: false, fieldId: null });
    };
    
    const handleConfirmDelete = async () => {
        if (!deleteConfirmation.fieldId) return;
        
        try {
            const response = await axios.delete("/api/field", { data: { fieldId: deleteConfirmation.fieldId } });
    
            if (response.data.success) {
                toast.success("Field deleted successfully");
                setFields(prevFields => prevFields.filter(field => field._id !== deleteConfirmation.fieldId));
            } else {
                toast.error(response.data.message || "Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting field");
            console.error(error);
        } finally {
            closeModal();
        }
    };
    

    const handleEdit = async (sourceName: string, oldSensorName: string, newSensorName: string, type: string) => {
        try {
            const response = await axios.put("/api/source", {
                sourceName,
                oldSensorName,
                newSensorName,
                type
            });
            if (response.data.success) {
                toast.success("Updated successfully");
                setSources(prevSources => prevSources.map(src => 
                    src.name === sourceName 
                        ? {
                            ...src,
                            flowSensors: type === "Flow Sensor" ? src.flowSensors.map(s => s.name === oldSensorName ? { ...s, name: newSensorName } : s) : src.flowSensors,
                            pressureSensors: type === "Pressure Sensor" ? src.pressureSensors.map(s => s.name === oldSensorName ? { ...s, name: newSensorName } : s) : src.pressureSensors,
                            valves: type === "Valve" ? src.valves.map(v => v.name === oldSensorName ? { ...v, name: newSensorName } : v) : src.valves
                        }
                        : src
                ));
            }
        } catch (error) {
            toast.error("Failed to update");
            console.error(error);
        }
    };

    const handleEditFields = async (fieldId, updatedData) => {
        try {
            const response = await axios.put("/api/field", {
                fieldId,
                ...updatedData
            });
    
            if (response.data.success) {
                toast.success("Field updated successfully");
                setFields(prevFields =>
                    prevFields.map(field =>
                        field._id === fieldId ? { ...field, ...updatedData } : field
                    )
                );
            } else {
                toast.error(response.data.message || "Failed to update");
            }
        } catch (error) {
            toast.error("Error updating field");
            console.error(error);
        }
    };

    return (
        <div className="flex">
            <Navbar activePage="settings" />
            <div className="flex flex-col ml-56 items-start min-h-screen w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                
                {/* Tab Selection */}
                <div className="flex space-x-8 border-b-2 w-full">
                    <span 
                        className={`cursor-pointer pb-3 text-lg font-semibold transition-colors duration-200 ${
                            selectedTab === 'field' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500'
                        }`} 
                        onClick={() => setSelectedTab('field')}
                    >
                        Fields
                    </span>
                    <span 
                        className={`cursor-pointer pb-3 text-lg font-semibold transition-colors duration-200 ${
                            selectedTab === 'source' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500'
                        }`} 
                        onClick={() => setSelectedTab('source')}
                    >
                        Sources
                    </span>
                </div>

                {/* Fields Table */}
                {selectedTab === 'field' && (
                    <div className="w-full max-w-5xl mt-4">
                        <table className="w-full border-collapse shadow-sm rounded-md overflow-hidden">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="px-4 py-3 text-left">Field Name</th>
                                    <th className="px-4 py-3 text-left">Size</th>
                                    <th className="px-4 py-3 text-left">Flow Sensor</th>
                                    <th className="px-4 py-3 text-left">Valve</th>
                                    <th className="px-4 py-3 text-left">Source</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field) => (
                                    <tr key={field.fieldName} className="border-b hover:bg-gray-100 transition">
                                        <td className="px-4 py-3">{field.fieldName}</td>
                                        <td className="px-4 py-3">{field.fieldSize}</td>
                                        <td className="px-4 py-3">{field.flowSensor}</td>
                                        <td className="px-4 py-3">{field.valve}</td>
                                        <td className="px-4 py-3">{field.source}</td>
                                        <td className="px-4 py-3 flex space-x-2">
                                        <button 
                                            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                                            // onClick={() => handleEditFields(field._id, {
                                            //     fieldName: field.fieldName,
                                            //     fieldSize: field.fieldSize,
                                            //     flowSensor: field.flowSensor,
                                            //     valve: field.valve,
                                            //     source: field.source,
                                            // })}
                                        >
                                            Edit
                                        </button>

                                        <button 
                                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                                            onClick={() => confirmDelete(field._id)}
                                        >
                                            Delete
                                        </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Sources Table */}
                {selectedTab === 'source' && (
                    <div className="w-full max-w-4xl mt-4">
                        <table className="w-full border-collapse shadow-sm rounded-md overflow-hidden">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="px-4 py-2 text-left">Source</th>
                                    <th className="px-4 py-2 text-left">Sensor/Valve Name</th>
                                    <th className="px-4 py-2 text-left">Type</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sources.map((source) =>
                                    [...source.flowSensors, ...source.pressureSensors, ...source.valves].map((item, index) => (
                                        <tr key={`${source.name}-${item.name}`} className="border-b hover:bg-gray-50">
                                            {/* Show Source Name only in the first row of each grouped source */}
                                            {index === 0 ? (
                                                <td rowSpan={source.flowSensors.length + source.pressureSensors.length + source.valves.length} className="px-4 py-2 font-bold align-top">
                                                    {source.name}
                                                </td>
                                            ) : null}
                                            <td className="px-4 py-2">{item.name}</td>
                                            <td className="px-4 py-2">
                                                {"flowRate" in item ? "Flow Sensor" : "pressure" in item ? "Pressure Sensor" : "Valve"}
                                            </td>
                                            <td className="px-4 py-2">
                                            <button 
                                                className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2"
                                                // onClick={() => handleEdit(source.name, item.name, "New Name", "flowRate" in item ? "Flow Sensor" : "pressure" in item ? "Pressure Sensor" : "Valve")}
                                            >
                                                Edit
                                            </button>

                                                <button 
                                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                                                    onClick={() => confirmSourceDelete(source.name, item.name, "flowRate" in item ? "Flow Sensor" : "pressure" in item ? "Pressure Sensor" : "Valve")}
                                                >
                                                    Delete
                                                </button>

                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {sourceDeleteConfirmation.show && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-md shadow-lg">
                            <h2 className="text-lg font-semibold text-center mb-4">Confirm Deletion</h2>
                            <p>Are you sure you want to delete this {sourceDeleteConfirmation.type}?</p>
                            <div className="flex justify-center space-x-4 mt-4">
                                <button className="bg-gray-400 px-4 text-white py-2 rounded-md hover:bg-gray-600" onClick={closeSourceDeleteModal}>Cancel</button>
                                <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600" onClick={handleConfirmSourceDelete}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
                {deleteConfirmation.show && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-md shadow-lg">
                            <h2 className="text-lg font-semibold text-center mb-4">Confirm Deletion</h2>
                            <p>Are you sure you want to delete this field?</p>
                            <div className="mt-4 flex justify-center space-x-4">
                                <button 
                                    className="bg-gray-400 px-4 py-2 rounded-md text-white hover:bg-gray-500"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="bg-red-500 px-4 py-2 rounded-md text-white hover:bg-red-600"
                                    onClick={handleConfirmDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
        </div>
    );
}
