"use client";

import React, { useState, useEffect, useRef, useReducer } from "react";
import mqtt from "mqtt";
import Navbar from "../../components/navbar";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface SensorData {
    flowRate?: number;
    totalWaterFlown?: number;
    pressure?: number;
    level?: number;
    valveStatus?: string;
    [key: string]: any;
    }

interface SensorState {
    [source: string]: Record<string, SensorData>;
}

function sensorReducer(
    state: SensorState,
    action: { type: string; payload: { topic: string; data: SensorData } }
    ): SensorState {
    switch (action.type) {
        case "UPDATE_SENSOR_DATA":
        const { topic, data } = action.payload;
        const [source, sensorType] = topic.split("/");
        return {
            ...state,
            [source]: {
            ...(state[source] || {}),
            [sensorType]: { ...(state[source]?.[sensorType] || {}), ...data },
            },
        };
        default:
        return state;
    }
}

export default function ProfilePage() {
    const [sensorData, dispatch] = useReducer(sensorReducer, {});
    const [isConnected, setIsConnected] = useState(false);
    const mqttClientRef = useRef<mqtt.MqttClient | null>(null);

    useEffect(() => {
        let mqttClient: mqtt.MqttClient | null = null;
    
        const connectToMqtt = () => {
            if (mqttClient) {
                mqttClient.end(true); // Ensure the old client is closed before creating a new one
            }
    
            mqttClient = mqtt.connect("ws://localhost:8083/mqtt", { keepalive: 60 });
    
            mqttClient.on("connect", () => {
                console.log("Connected to MQTT broker");
                setIsConnected(true);
    
                const topics = generateTopics();
                mqttClient?.subscribe(topics, { qos: 1 }, (err) => {
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
                    dispatch({ type: "UPDATE_SENSOR_DATA", payload: { topic, data: parsedMessage } });
                } catch (error) {
                    console.error("Error parsing message:", error);
                }
            });
    
            mqttClient.on("close", () => {
                console.log("Disconnected from MQTT broker");
                setIsConnected(false);
    
                // Reconnect after a delay
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
    
        // Cleanup function
        return () => {
            if (mqttClient) {
                mqttClient.end(true);
                console.log("MQTT client disconnected and cleaned up");
            }
        };
    }, []);
    

    function generateTopics(): string[] {
        const sources = 2;
        const flowSensors = 4;
        const pressureSensors = 2;
        const valves = 5;
        const waterLevelSensors = 1;

        const topics: string[] = [];

        for (let source = 1; source <= sources; source++) {
        for (let flow = 1; flow <= flowSensors; flow++) {
            topics.push(`source${source}/flowsensor/flow${flow}`);
        }
        for (let pressure = 1; pressure <= pressureSensors; pressure++) {
            topics.push(`source${source}/pressuresensor/pressure${pressure}`);
        }
        for (let valve = 1; valve <= valves; valve++) {
            topics.push(`source${source}/valve/valve${valve}`);
        }
        for (let level = 1; level <= waterLevelSensors; level++) {
            topics.push(`source${source}/waterlevelsensor/level${level}`);
        }
        }
        return topics;
    }

    const createSemicircularData = (value: number, maxValue: number) => ({
        labels: ["Current Value", "Remaining"],
        datasets: [
        {
            data: [value, Math.max(maxValue - value, 0)],
            backgroundColor: ["#42a5f5", "#e0e0e0"],
            borderWidth: 0,
        },
        ],
    });

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
            {Object.entries(sensorData).map(([source, sensors]) => (
            <div key={source} className="w-full mb-6">
                <h2 className="text-md font-bold mb-3">{source.toUpperCase()}</h2>
                <div className="space-y-6">
                {["flowsensor", "pressuresensor", "valve", "waterlevelsensor"].map((type) => (
                    <div key={type}>
                    <h3 className="text-sm font-bold mb-2 capitalize">{type.replace("sensor", "")}</h3>
                    <div className="flex overflow-x-auto gap-4">
                        {Object.entries(sensors)
                        .filter(([key]) => key.startsWith(type))
                        .map(([key, data]) => {
                            const maxValue =
                            type === "flowsensor"
                                ? 10
                                : type === "pressuresensor"
                                ? 100000
                                : type === "waterlevelsensor"
                                ? 100
                                : 1;
                            const unit =
                            type === "flowsensor"
                                ? "L/s"
                                : type === "pressuresensor"
                                ? "Pa"
                                : type === "waterlevelsensor"
                                ? "%"
                                : "";

                            return (
                            <div
                                key={key}
                                className="flex flex-col items-center p-4 bg-white shadow rounded-md min-w-[200px]"
                            >
                                <h4 className="text-xs font-semibold mb-2">{key.toUpperCase()}</h4>
                                <div className="relative">
                                <Doughnut
                                    data={createSemicircularData(
                                    data.flowRate || data.pressure || data.level || 0,
                                    maxValue
                                    )}
                                    options={{
                                    rotation: -90,
                                    circumference: 180,
                                    plugins: { legend: { display: false } },
                                    cutout: "70%",
                                    }}
                                />
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold">
                                    {(data.flowRate || data.pressure || data.level || 0).toFixed(2)} {unit}
                                </div>
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-gray-600 w-full">
                                <span>0</span>
                                <span>{maxValue} {unit}</span>
                                </div>
                                {type === "flowsensor" && (
                                <p className="mt-2 text-xs">
                                    <strong>Total Water Flow:</strong> {data.totalWaterFlown || 0} L
                                </p>
                                )}
                            </div>
                            );
                        })}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}
