"use client";

import React, { useState, useEffect } from "react";
import mqtt from "mqtt";
import Navbar from "../../components/navbar";

export default function ProfilePage() {
    const [sensorData, setSensorData] = useState({});
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to the MQTT broker using WebSocket
        const mqttClient = mqtt.connect("ws://localhost:8083/mqtt");

        mqttClient.on("connect", () => {
            console.log("Connected to MQTT broker");
            setIsConnected(true);
            
            // Subscribe to relevant topics
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
            const parsedMessage = JSON.parse(message.toString());
            setSensorData((prevData) => ({
                ...prevData,
                [topic]: parsedMessage,
            }));
        });

        mqttClient.on("close", () => {
            console.log("Disconnected from MQTT broker");
            setIsConnected(false);
        });

        return () => {
            mqttClient.end();
        };
    }, []);

    // Generate MQTT topics dynamically
    function generateTopics() {
        const sources = 10;
        const sensorsPerType = 30;
        const types = ["flowsensor/flow", "pressuresensor/pressure", "valve/valve"];
        const topics = [];

        for (let source = 1; source <= sources; source++) {
            for (const type of types) {
                for (let sensor = 1; sensor <= sensorsPerType; sensor++) {
                    topics.push(`source${source}/${type}${sensor}`);
                }
            }
        }
        return topics;
    }

    return (
        <div className="flex">
            <Navbar activePage="profile" />

            <div className="flex flex-col items-center justify-center w-full p-6 bg-gray-50 shadow-lg rounded-md m-4">
                <h1 className="text-2xl font-bold mb-4">Real-Time Sensor Dashboard</h1>
                <p className="mb-4">
                    Status:{" "}
                    <span
                        className={`font-semibold ${
                            isConnected ? "text-green-500" : "text-red-500"
                        }`}
                    >
                        {isConnected ? "Connected" : "Disconnected"}
                    </span>
                </p>

                <div className="w-full max-w-4xl overflow-x-auto">
                    <table className="table-auto w-full border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">Topic</th>
                                <th className="border border-gray-300 px-4 py-2">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(sensorData).map(([topic, data], index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2">{topic}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {JSON.stringify(data)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
