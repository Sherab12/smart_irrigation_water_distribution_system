"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/navbar";
import mqtt from "mqtt";

type Schedule = {
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    volume: number; // in liters
    progress: string; // e.g., "Running", "Completed", "Scheduled"
};

type FieldData = {
    fieldName: string;
    source: string;
    flowSensor: string;
    valve: string;
    schedule: Schedule | null;
};

export default function SchedulePage() {
    const [fields, setFields] = useState<FieldData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<string>("");
    const [volume, setVolume] = useState<number>(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmFieldIndex, setConfirmFieldIndex] = useState<number | null>(null);

    const fetchFields = async () => {
        try {
            const fieldsResponse = await axios.get("/api/field");
            const schedulesResponse = await axios.get("/api/schedules");

            const schedules = schedulesResponse.data.schedules;

            // Transform field data to include schedule information
            const transformedData: FieldData[] = fieldsResponse.data.data.map((field: any) => {
                const fieldSchedule = schedules.find(
                    (schedule: any) => schedule.sensorName === field.flowSensor && schedule.sourceName === field.source
                );
                return {
                    ...field,
                    schedule: fieldSchedule || null,
                };
            });

            setFields(transformedData);
        } catch (error) {
            console.error("Error fetching fields or schedules:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (fieldIndex: number) => {
        setSelectedFieldIndex(fieldIndex);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setStartTime("");
        setVolume(0);
    };

    const handleAddOrEditSchedule = async () => {
        if (!startTime || selectedFieldIndex === null || volume <= 0) {
            alert("Please provide valid details.");
            return;
        }
    
        const field = fields[selectedFieldIndex];
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const durationInSeconds = volume / 0.005; // 0.5 L/s rate
        const durationInMinutes = Math.ceil(durationInSeconds / 60);
        const currentStartTime = new Date();
        currentStartTime.setHours(startHours, startMinutes, 0);
        const endTime = new Date(currentStartTime.getTime());
        endTime.setMinutes(endTime.getMinutes() + durationInMinutes);
    
        const formattedStartTime = currentStartTime.toTimeString().slice(0, 5);
        const formattedEndTime = endTime.toTimeString().slice(0, 5);
    
        const newSchedule = {
            sourceName: field.source,
            sensorName: field.flowSensor,
            startTime: formattedStartTime,
            endTime: formattedEndTime,
            duration: durationInMinutes,
            volume,
            progress: "Scheduled",
        };
    
        try {
            // Save to database
            await axios.post("/api/schedules", newSchedule);
    
            // Publish to MQTT
            const mqttClient = mqtt.connect("ws://localhost:8083/mqtt");
            mqttClient.on("connect", () => {
                console.log("Connected to MQTT broker");
                const topic = `${String(field.source)}/valve/automation/${String(field.valve)}`;
                mqttClient.publish(topic, JSON.stringify(newSchedule), (error) => {
                    if (error) {
                        console.error("Error publishing to MQTT:", error);
                    } else {
                        console.log("Published to MQTT:", topic);
                        console.log("Payload:", JSON.stringify(newSchedule));
                    }
                    mqttClient.end();
                });
            });
            
            fetchFields(); // Refresh field data
            handleCloseModal();
        } catch (error) {
            console.error("Error adding/editing schedule:", error);
            alert("Failed to add or edit schedule.");
        }
    };

    const handleOpenConfirmModal = (fieldIndex: number) => {
        setConfirmFieldIndex(fieldIndex);
        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        setConfirmFieldIndex(null);
    };

    const handleConfirmRemoveSchedule = async () => {
        if (confirmFieldIndex === null) return;

        const field = fields[confirmFieldIndex];
        try {
            if (field.schedule) {
                await axios.delete(
                    `/api/schedules?sensorName=${field.flowSensor}&sourceName=${field.source}`
                );
            }
            fetchFields(); // Refresh data
            handleCloseConfirmModal();
        } catch (error) {
            console.error("Error removing schedule:", error);
            alert("Failed to remove schedule.");
        }
    };

    useEffect(() => {
        fetchFields();
    }, []);

    return (
        <div className="flex">
            <Navbar activePage="schedule" />
            <div className="flex flex-col items-center ml-56 min-h-screen w-full p-8 bg-white shadow-lg rounded-lg m-4">
                <h1 className="text-2xl font-bold mb-6 text-blue-700">Schedule Management</h1>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <div className="w-full">
                        <table className="table-auto w-full text-sm text-left text-gray-700 border border-gray-200 shadow-md rounded-lg">
                            <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Field Name</th>
                                    <th className="px-6 py-3">Source</th>
                                    <th className="px-6 py-3">Flow Sensor</th>
                                    <th className="px-6 py-3">Schedule Details</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, fieldIndex) => (
                                    <tr key={fieldIndex} className="bg-white border-b">
                                        <td className="px-6 py-4 font-medium text-gray-900">{field.fieldName}</td>
                                        <td className="px-6 py-4">{field.source}</td>
                                        <td className="px-6 py-4">{field.flowSensor}</td>
                                        <td className="px-6 py-4">
                                            {field.schedule ? (
                                                <>
                                                    <p><strong>Start:</strong> {field.schedule.startTime}</p>
                                                    <p><strong>End:</strong> {field.schedule.endTime}</p>
                                                    <p><strong>Volume:</strong> {field.schedule.volume} L</p>
                                                    <p><strong>Progress:</strong> {field.schedule.progress}</p>
                                                </>
                                            ) : (
                                                <span className="text-gray-500">No schedule</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleOpenModal(fieldIndex)}
                                                className="bg-blue-500 text-white px-4 py-2 mr-3 rounded"
                                            >
                                                {field.schedule ? "Edit Schedule" : "Add Schedule"}
                                            </button>
                                            <button
                                                onClick={() => handleOpenConfirmModal(fieldIndex)}
                                                className="bg-red-500 text-white px-4 py-2 rounded"
                                            >
                                                Remove Schedule
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {showModal && selectedFieldIndex !== null && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                            <h2 className="text-2xl font-bold mb-4">Schedule</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Volume (L)</label>
                                <input
                                    type="number"
                                    value={volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddOrEditSchedule}
                                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showConfirmModal && confirmFieldIndex !== null && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white items-center rounded-lg shadow-lg p-6 w-96">
                            <h2 className="text-2xl text-center font-bold mb-4">Confirm</h2>
                            <p className="text-center">Are you sure you want to remove the schedule?</p>
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={handleConfirmRemoveSchedule}
                                    className="bg-red-500 text-white px-4 py-2 rounded mr-4"
                                >
                                    Remove
                                </button>
                                <button
                                    onClick={handleCloseConfirmModal}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
