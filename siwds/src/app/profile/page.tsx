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

interface FieldData {
  fieldName: string;
  fieldSize: string;
  source: string;
  flowSensor: string;
  valve: string;
}

interface SensorState {
  [topic: string]: SensorData;
}

function sensorReducer(
  state: SensorState,
  action: { type: string; payload: { topic: string; data: SensorData } }
): SensorState {
  switch (action.type) {
    case "UPDATE_SENSOR_DATA":
      const { topic, data } = action.payload;
      return { ...state, [topic]: { ...(state[topic] || {}), ...data } };
    default:
      return state;
  }
}


export default function ProfilePage() {
  const [sensorData, dispatch] = useReducer(sensorReducer, {});
  const [isConnected, setIsConnected] = useState(false);
  const [fields, setFields] = useState<FieldData[]>([]); // State to store fields data
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);

  // Fetch fields data from the database
  useEffect(() => {
    async function fetchFields() {
      try {
        const response = await fetch("/api/field", { method: "GET" });
        const data = await response.json();
        if (data.success) {
          setFields(data.data);
        } else {
          console.error("Failed to fetch fields:", data.message);
        }
      } catch (error) {
        console.error("Error fetching fields:", error);
      }
    }
    fetchFields();
  }, []);

  // MQTT client setup
  useEffect(() => {
    if (mqttClientRef.current) {
      mqttClientRef.current.end(true);
    }
  
    mqttClientRef.current = mqtt.connect("ws://localhost:8083/mqtt", { keepalive: 60 });
    const mqttClient = mqttClientRef.current;
  
    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
      setIsConnected(true);
  
      fields.forEach((field) => {
        const flowTopic = `${field.source}/flowsensor/${field.flowSensor}`;
        const valveTopic = `${field.source}/valve/${field.valve}`;
        mqttClient.subscribe(flowTopic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`Failed to subscribe to ${flowTopic}:`, err);
          } else {
            console.log(`Subscribed to ${flowTopic}`);
          }
        });
        mqttClient.subscribe(valveTopic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`Failed to subscribe to ${valveTopic}:`, err);
          } else {
            console.log(`Subscribed to ${valveTopic}`);
          }
        });
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
    });
  
    mqttClient.on("error", (error) => {
      console.error("MQTT Client Error:", error);
    });
  
    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end(true);
        console.log("MQTT client disconnected and cleaned up");
      }
    };
  }, [fields]);

  const createSemicircularData = (value: number, maxValue: number) => ({
    labels: ["Flow Rate", "Remaining"],
    datasets: [
      {
        data: [value, Math.max(maxValue - value, 0)],
        backgroundColor: ["#42a5f5", "#e0e0e0"],
        borderWidth: 0,
      },
    ],
  });

  // Group fields by source
  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.source]) acc[field.source] = [];
    acc[field.source].push(field);
    return acc;
  }, {} as { [source: string]: FieldData[] });

  return (
    <div className="flex">
      <Navbar activePage="profile" />
      <div className="flex flex-col items-center justify-center ml-56 w-full min-h-screen p-6 bg-gray-50 shadow-lg rounded-md m-4">
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

            {Object.keys(groupedFields).map((source) => (
              <div key={source} className="mb-6 w-full">
                <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">{source}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {groupedFields[source].map((field) => {
                  const flowTopic = `${field.source}/flowsensor/${field.flowSensor}`;
                  const valveTopic = `${field.source}/valve/${field.valve}`;
                  const flowRate = sensorData[flowTopic]?.flowRate || 0;
                  const totalWaterFlown = sensorData[flowTopic]?.totalWaterFlown || 0;
                  const valveStatus = sensorData[valveTopic]?.valveStatus || "closed"; // Default to Closed
                  const maxValue = 10; // Max value for the chart

                  const toggleValve = () => {
                    // Simply update the UI based on the received MQTT message.
                    console.log(`Valve status toggled based on received data: ${valveStatus}`);
                  };
                  
                  

                  return (
                    <div
                      key={field.fieldName}
                      className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
                    >
                      <h3 className="font-bold text-gray-800 text-center mb-2">{field.fieldName}</h3>
                      <p className="text-sm text-gray-600 mb-2 text-center">
                        Field Size: <span className="font-medium">{field.fieldSize} km&sup2;</span>
                      </p>
                      <div className="relative w-52 mx-auto">
                        <Doughnut
                          data={createSemicircularData(flowRate, maxValue)}
                          options={{
                            circumference: 180,
                            rotation: -90,
                            plugins: { legend: { display: false } },
                            cutout: "70%",
                          }}
                        />
                        {/* Flow Rate Label */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 text-center">
                          <span className="font-bold text-base">{flowRate.toFixed(2)} L/min</span>
                        </div>
                        {/* Left Limit */}
                        <div className="absolute bottom-7 left-3 text-xs text-gray-600">
                          <span>0</span>
                        </div>
                        {/* Right Limit */}
                        <div className="absolute bottom-7 right-1 text-xs text-gray-600">
                          <span>{maxValue}</span>
                        </div>
                      </div>

                      <div className="mt-1 text-center">
                        <p className="text-sm text-gray-600">
                          Total Water Flown:{" "}
                          <span className="font-medium">{totalWaterFlown} L</span>
                        </p>
                      </div>

                      <div className="mt-1 text-center">
                        <p className="text-sm text-gray-600">
                          Valve Status:{" "}
                          <span className="font-medium">{valveStatus}</span>
                        </p>
                      </div>

                      

                      {/* Valve Status and Toggle */}
                      <div className="mt-4 text-center">
                        <div className="flex items-center justify-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            {/* The checkbox reflects valveStatus, ensure it's controlled by this state */}
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={valveStatus === "open"} // Reflect current status
                              onChange={() => {
                                const newStatus = valveStatus === "open" ? "closed" : "open";
                                console.log(`Manually toggling valve to: ${newStatus}`);

                                // Update UI immediately for instant feedback
                                dispatch({
                                  type: "UPDATE_SENSOR_DATA",
                                  payload: { topic: valveTopic, data: { valveStatus: newStatus } }
                                });

                                // Send MQTT command to change valve status
                                if (mqttClientRef.current) {
                                  mqttClientRef.current.publish(
                                    valveTopic,
                                    JSON.stringify({ valveStatus: newStatus }),
                                    { qos: 1 }
                                  );
                                }
                              }}
                            />

                            <div
                              className={`relative w-32 h-14 rounded-full flex items-center transition-colors ${
                                valveStatus === "open" ? "bg-green-500" : "bg-red-500"
                              }`}
                            >
                              {/* Text for Open */}
                              <span
                                className={`absolute left-5 text-white font-semibold text-base transition-opacity ease-in-out duration-200 ${
                                  valveStatus === "open" ? "opacity-100" : "opacity-0"
                                }`}
                              >
                                Open
                              </span>

                              {/* Text for Close */}
                              <span
                                className={`absolute right-5 text-white font-semibold text-base transition-opacity ease-in-out duration-200 ${
                                  valveStatus === "open" ? "opacity-0" : "opacity-100"
                                }`}
                              >
                                Close
                              </span>

                              {/* Slider Knob */}
                              <span
                                className={`absolute w-12 h-12 bg-white border-2 border-gray-300 rounded-full transition-transform ease-in-out duration-200 ${
                                  valveStatus === "open" ? "translate-x-20" : "translate-x-1"
                                }`}
                              ></span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
