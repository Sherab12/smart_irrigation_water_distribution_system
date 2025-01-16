"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/navbar";

type Schedule = {
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    volume: number; // in liters
    progress: string; // e.g., "Running", "Completed", "Scheduled"
};

type FlowSensorData = {
    name: string;
    schedule: Schedule | null;
};

type SourceData = {
    name: string;
    flowSensors: FlowSensorData[];
};

export default function SchedulePage() {
    const [sources, setSources] = useState<SourceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSourceIndex, setSelectedSourceIndex] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<string>("");
    const [volumes, setVolumes] = useState<number[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmSourceIndex, setConfirmSourceIndex] = useState<number | null>(null);

    const fetchSources = async () => {
        try {
            const sourcesResponse = await axios.get("/api/source");
            const schedulesResponse = await axios.get("/api/schedules");

            const schedules = schedulesResponse.data.schedules;

            const transformedData: SourceData[] = Object.entries(sourcesResponse.data).map(
                ([key, value]: [string, any]) => ({
                    name: key,
                    flowSensors: value.flowSensors.map((sensor: string) => {
                        const sensorSchedule = schedules.find(
                            (schedule: any) => schedule.sensorName === sensor && schedule.sourceName === key
                        );
                        return {
                            name: sensor,
                            schedule: sensorSchedule || null,
                        };
                    }),
                })
            );

            setSources(transformedData);
        } catch (error) {
            console.error("Error fetching sources or schedules:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (sourceIndex: number) => {
        setSelectedSourceIndex(sourceIndex);
        setVolumes(sources[sourceIndex].flowSensors.map(() => 0)); // Initialize volumes for each flow sensor
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setStartTime("");
        setVolumes([]);
    };

    const handleAddOrEditSchedule = async () => {
        if (!startTime || selectedSourceIndex === null) {
            alert("Please provide a valid start time and ensure a source is selected.");
            return;
        }
    
        const source = sources[selectedSourceIndex];
        let currentStartTime = new Date();
        const [startHours, startMinutes] = startTime.split(":").map(Number);
    
        // Set the initial start time
        currentStartTime.setHours(startHours, startMinutes, 0);
    
        try {
            for (let i = 0; i < source.flowSensors.length; i++) {
                const sensor = source.flowSensors[i];
                const volume = volumes[i];
    
                if (volume > 0) {
                    // Calculate the duration in seconds
                    const durationInSeconds = volume / 0.005; // 0.5 L/s rate
                    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    
                    // Calculate the end time for this flow sensor
                    const sensorEndTime = new Date(currentStartTime.getTime());
                    sensorEndTime.setMinutes(sensorEndTime.getMinutes() + durationInMinutes);
    
                    const formattedStartTime = currentStartTime
                        .toTimeString()
                        .split(" ")[0]
                        .slice(0, 5);
                    const formattedEndTime = sensorEndTime
                        .toTimeString()
                        .split(" ")[0]
                        .slice(0, 5);
    
                    const newSchedule = {
                        sourceName: source.name,
                        sensorName: sensor.name,
                        startTime: formattedStartTime,
                        endTime: formattedEndTime,
                        duration: durationInMinutes, // in minutes
                        volume,
                        progress: "Scheduled",
                    };
    
                    await axios.post("/api/schedules", newSchedule);
    
                    // Update the currentStartTime for the next sensor
                    currentStartTime = sensorEndTime;
                }
            }
    
            fetchSources(); // Refresh data
            handleCloseModal();
        } catch (error) {
            console.error("Error adding/editing schedule:", error);
            alert("Failed to add or edit schedule.");
        }
    };
    

    const handleOpenConfirmModal = (sourceIndex: number) => {
        setConfirmSourceIndex(sourceIndex);
        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        setConfirmSourceIndex(null);
    };

    const handleConfirmRemoveSchedule = async () => {
        if (confirmSourceIndex === null) return;

        const source = sources[confirmSourceIndex];
        try {
            for (const sensor of source.flowSensors) {
                if (sensor.schedule) {
                    await axios.delete(`/api/schedules?sensorName=${sensor.name}&sourceName=${source.name}`);
                }
            }
            fetchSources(); // Refresh data
            handleCloseConfirmModal();
        } catch (error) {
            console.error("Error removing schedule:", error);
            alert("Failed to remove schedule.");
        }
    };

    useEffect(() => {
        fetchSources();
    }, []);

    return (
        <div className="flex">
            <Navbar activePage="schedule" />
            <div className="flex flex-col items-center ml-56 justify-center min-h-screen w-full p-8 bg-white shadow-lg rounded-lg m-4">
                <h1 className="text-3xl font-bold mb-6 text-blue-700">Schedule Management</h1>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <div className="w-full">
                        <table className="table-auto w-full text-sm text-left text-gray-700 border border-gray-200 shadow-md rounded-lg">
                            <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Source Name</th>
                                    <th className="px-6 py-3">Flow Sensors</th>
                                    <th className="px-6 py-3">Schedule Details</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sources.map((source, sourceIndex) => (
                                    <tr key={sourceIndex} className="bg-white border-b">
                                        <td className="px-6 py-4 font-medium text-gray-900">{source.name}</td>
                                        <td className="px-6 py-4">
                                            {source.flowSensors.map(sensor => sensor.name).join(", ")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {source.flowSensors.every(sensor => !sensor.schedule) ? (
                                                <span className="text-gray-500">No schedule</span>
                                            ) : (
                                                source.flowSensors.map((sensor, index) => (
                                                    sensor.schedule && (
                                                        <div key={index}>
                                                            <p><strong>{sensor.name}</strong></p>
                                                            <p><strong>Start:</strong> {sensor.schedule.startTime}</p>
                                                            <p><strong>End:</strong> {sensor.schedule.endTime}</p>
                                                            <p><strong>Volume:</strong> {sensor.schedule.volume} L </p>
                                                            <p><strong>Progress:</strong> {sensor.schedule.progress}</p>
                                                        </div>
                                                    )
                                                ))
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleOpenModal(sourceIndex)}
                                                className="bg-blue-500 text-white px-4 py-2 mr-3 rounded"
                                            >
                                                {source.flowSensors.every(sensor => !sensor.schedule)
                                                    ? "Add Schedule"
                                                    : "Edit Schedule"}
                                            </button>
                                            <button
                                                onClick={() => handleOpenConfirmModal(sourceIndex)}
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
                {showModal && selectedSourceIndex !== null && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                            <h2 className="text-2xl font-bold mb-4">Schedule</h2>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Start Time (HH:mm)</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                            </div>
                            {sources[selectedSourceIndex].flowSensors.map((sensor, index) => (
                                <div key={index} className="mb-4">
                                    <label className="block font-medium mb-2">{sensor.name} Volume (L)</label>
                                    <input
                                        type="number"
                                        value={volumes[index]}
                                        onChange={e => {
                                            const newVolumes = [...volumes];
                                            newVolumes[index] = Number(e.target.value);
                                            setVolumes(newVolumes);
                                        }}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleCloseModal}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddOrEditSchedule}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                            <h2 className="text-2xl text-center font-bold mb-4">Confirm Removal</h2>
                            <p className="text-center">Are you sure you want to remove the schedule for this source?</p>
                            <div className="flex justify-center gap-4 mt-6">
                                <button
                                    onClick={handleCloseConfirmModal}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRemoveSchedule}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
