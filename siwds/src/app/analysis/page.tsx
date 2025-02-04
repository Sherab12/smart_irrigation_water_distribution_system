"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Navbar from "../../components/navbar";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Field {
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

export default function AnalysisPage() {
    const [fields, setFields] = useState<Field[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [expandedSource, setExpandedSource] = useState<string | null>(null);
    const [highlightedSource, setHighlightedSource] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fieldResponse = await axios.get("api/field");
                const sourceResponse = await axios.get("api/source");

                setFields(fieldResponse.data.data as Field[]);
                const sourcesArray = Object.keys(sourceResponse.data).map((key) => {
                    const source = sourceResponse.data[key];
                    return {
                        name: key,
                        flowSensors: source.flowSensors.map((sensor: any) =>
                            typeof sensor === "string"
                                ? { name: sensor, flowRate: 0, totalWaterFlow: 0 }
                                : { ...sensor, totalWaterFlow: sensor.totalWaterFlow ?? 0 }
                        ),
                        pressureSensors: source.pressureSensors.map((sensor: any) =>
                            typeof sensor === "string"
                                ? { name: sensor, pressure: 0 }
                                : sensor
                        ),
                        valves: source.valves.map((valve: any) =>
                            typeof valve === "string"
                                ? { name: valve, state: "closed", percentageOpen: 0 }
                                : valve
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

    const handleSourceClick = (sourceName: string) => {
        setExpandedSource(expandedSource === sourceName ? null : sourceName);
        setHighlightedSource(highlightedSource === sourceName ? null : sourceName);
    };

    const totalWaterPerSource = {
        labels: sources.map((source) => source.name),
        datasets: [
            {
                label: "Total Water Consumption (L)",
                data: sources.map((source) =>
                    source.flowSensors.reduce((acc, sensor) => acc + sensor.totalWaterFlow, 0)
                ),
                backgroundColor: sources.map((source) =>
                    highlightedSource === source.name ? "#4CAF50" : "#2196F3"
                ),
            },
        ],
    };

    return (
        <div className="flex">
            <Navbar activePage="analysis" />

            <div className="flex flex-col ml-56 items-center justify-center min-h-screen w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">

                {/* Total Water Consumption Graph */}
                <div className="w-full max-w-4xl mb-6">
                    <h2 className="text-xl text-center font-semibold mb-4 mt-2 text-black">Total Water Consumption</h2>
                    <Bar data={totalWaterPerSource} />
                </div>

                {/* Sources Section */}
                <div className="w-full max-w-4xl">
                    {sources.map((source) => {
                        const flowData = source.flowSensors.map((sensor) => {
                            const field = fields.find((f) => f.source === source.name && f.flowSensor === sensor.name);
                            return {
                                label: field ? `${field.fieldName} (${field.fieldSize})` : sensor.name,
                                totalWaterFlow: sensor.totalWaterFlow,
                            };
                        });
                        

                        const pressureData = {
                            labels: source.pressureSensors.map((sensor) => sensor.name),
                            datasets: [
                                {
                                    label: "Pressure (psi)",
                                    data: source.pressureSensors.map((sensor) => sensor.pressure),
                                    borderColor: "#4CAF50",
                                    fill: false,
                                },
                            ],
                        };

                        const flowSensorData = {
                            labels: flowData.map((data) => data.label),
                            datasets: [
                                {
                                    label: "Total Water Flow (L)",
                                    data: flowData.map((data) => data.totalWaterFlow),
                                    backgroundColor: "#2196F3",
                                },
                            ],
                        };

                        return (
                            <div key={source.name} className="p-4 mb-4 border rounded-md shadow-sm bg-white">
                                <div
                                    className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                                    onClick={() => handleSourceClick(source.name)}
                                >
                                    <span className="text-lg font-semibold text-blue-800">{source.name}</span>
                                    <span className={`transform transition-transform ${expandedSource === source.name ? "rotate-90" : "rotate-0"}`}>
                                        ➤
                                    </span>
                                </div>

                                {expandedSource === source.name && (
                                    <div className="flex gap-4 mt-2">
                                        <div className="w-1/2">
                                            <h3 className="font-semibold text-gray-700">Flow Sensor Water Flow</h3>
                                            <Bar data={flowSensorData} />
                                        </div>

                                        <div className="w-1/2">
                                            <h3 className="font-semibold text-gray-700">Pressure Changes</h3>
                                            <Line data={pressureData} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
} 