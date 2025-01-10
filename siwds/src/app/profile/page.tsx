"use client";

import React, { useState, useEffect, useRef } from "react";
import mqtt from "mqtt";
import Navbar from "../../components/navbar";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SensorData {
    flowRate: number;
    totalWaterFlown: number;
    [key: string]: any;
}

export default function ProfilePage() {
    const [sensorData, setSensorData] = useState<Record<string, SensorData>>({});
    const [isConnected, setIsConnected] = useState(false);
    const sensorDataRef = useRef<Record<string, SensorData>>({});
    const mqttClientRef = useRef<mqtt.MqttClient | null>(null);

    useEffect(() => {
        const connectToMqtt = () => {
            const mqttClient = mqtt.connect("ws://localhost:8083/mqtt", { keepalive: 60 });
            mqttClientRef.current = mqttClient;
    
            mqttClient.on("connect", () => {
                console.log("Connected to MQTT broker");
                setIsConnected(true);
    
                const topics = generateTopics();
                mqttClient.subscribe(topics, { qos: 1 }, (err) => {
                    if (err) {
                        console.error("Failed to subscribe:", err);
                    } else {
                        console.log("Subscribed to all sensor topics");
                    }
                });
            });
    
            mqttClient.on("message", (topic, message) => {
                try {
                    const parsedMessage = JSON.parse(message.toString()) as SensorData;
                    sensorDataRef.current = { ...sensorDataRef.current, [topic]: parsedMessage };
                    requestAnimationFrame(() => setSensorData({ ...sensorDataRef.current }));
                } catch (error) {
                    console.error("Error parsing message:", error);
                }
            });
    
            mqttClient.on("close", () => {
                console.log("Disconnected from MQTT broker");
                setIsConnected(false);
                setTimeout(() => {
                    console.log("Reconnecting to MQTT broker...");
                    connectToMqtt();
                }, 5000);
            });
    
            mqttClient.on("error", (error) => {
                console.error("MQTT Client Error:", error);
            });
        };
    
        connectToMqtt();
    
        return () => {
            if (mqttClientRef.current) {
                mqttClientRef.current.end(true);
                mqttClientRef.current = null;
            }
        };
    }, []);
    

    function generateTopics(): string[] {
        const sources = 5;
        const sensorsPerType = 5;
        const types = ["flowsensor/flow", "pressuresensor/pressure", "valve/valve"];
        const topics: string[] = [];

        for (let source = 1; source <= sources; source++) {
            for (const type of types) {
                for (let sensor = 1; sensor <= sensorsPerType; sensor++) {
                    topics.push(`source${source}/${type}${sensor}`);
                }
            }
        }
        return topics;
    }

    const createSemicircularData = (flowRate: number) => {
        const maxFlowRate = 1; // Reduced limit for testing
        const currentFlowRate = Math.min(flowRate, maxFlowRate);
        const remainingFlow = maxFlowRate - currentFlowRate;

        return {
            labels: ["Flow Rate", "Remaining"],
            datasets: [
                {
                    data: [currentFlowRate, remainingFlow],
                    backgroundColor: ["#4caf50", "#e0e0e0"],
                    borderWidth: 0,
                },
            ],
        };
    };

    return (
        <div className="flex">
            <Navbar activePage="profile" />

            <div className="flex flex-col items-center justify-center w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                <h1 className="text-lg font-bold mb-3">Real-Time Sensor Dashboard</h1>
                <div className="mb-3 flex items-center space-x-2 text-sm">
                    <span>Status:</span>
                    <span
                        className={`flex items-center space-x-1 font-semibold ${
                            isConnected ? "text-green-500" : "text-red-500"
                        }`}
                    >
                        {isConnected ? (
                            <>
                                {/* Connected: Green Wi-Fi Icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                >
                                    <path d="M12 3C7.03 3 2.3 5.26.59 8.75l1.72 1.4C3.91 7.69 7.88 5.8 12 5.8s8.09 1.89 9.69 4.35l1.72-1.4C21.7 5.26 16.97 3 12 3zm0 8.2c-2.5 0-4.8 1.23-6.2 3.09l1.64 1.31c1.01-1.32 2.62-2.2 4.56-2.2 1.94 0 3.55.88 4.56 2.2l1.64-1.31c-1.4-1.86-3.7-3.09-6.2-3.09zm0 4.79c-1.23 0-2.4.64-3.04 1.67l1.55 1.24c.52-.63 1.4-1.03 2.5-1.03s1.98.4 2.5 1.03l1.55-1.24c-.64-1.03-1.81-1.67-3.04-1.67z" />
                                </svg>
                                <span>Connected</span>
                            </>
                        ) : (
                            <>
                                {/* Disconnected: Red Wi-Fi Icon with Cut Line */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    width="16"
                                    height="16"
                                >
                                    <path d="M12 3C7.03 3 2.3 5.26.59 8.75l1.72 1.4C3.91 7.69 7.88 5.8 12 5.8s8.09 1.89 9.69 4.35l1.72-1.4C21.7 5.26 16.97 3 12 3zm0 8.2c-2.5 0-4.8 1.23-6.2 3.09l1.64 1.31c1.01-1.32 2.62-2.2 4.56-2.2 1.94 0 3.55.88 4.56 2.2l1.64-1.31c-1.4-1.86-3.7-3.09-6.2-3.09zm0 4.79c-1.23 0-2.4.64-3.04 1.67l1.55 1.24c.52-.63 1.4-1.03 2.5-1.03s1.98.4 2.5 1.03l1.55-1.24c-.64-1.03-1.81-1.67-3.04-1.67z" />
                                    <path d="M3 3L21 21" stroke="#D32F2F" strokeWidth="2" />
                                </svg>
                                <span>Disconnected</span>
                            </>
                        )}
                    </span>
                </div>


            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-2xl">
                {Object.entries(sensorData).map(([topic, data], index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center justify-center p-3 bg-white shadow rounded-md"
                    >
                        <h3 className="text-xs font-semibold mb-1 text-center">{topic}</h3>

                        {/* Smaller Doughnut Chart */}
                        <Doughnut
                            data={createSemicircularData(data.flowRate)}
                            options={{
                                rotation: -90,
                                circumference: 180,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                },
                                cutout: "70%", // Adjusted cutout for smaller size
                            }}
                            width={100} // Reduced width
                            height={50} // Reduced height
                        />

                        <p className="mt-1 text-xs text-center">
                            <strong>Total Water Flown:</strong>{" "}
                            {data.totalWaterFlown.toFixed(2)} L
                        </p>
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
}
