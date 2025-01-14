import { connect } from "@/dbConfig/db";
import User from "@/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import mqtt from 'mqtt';
import Source from "@/models/source";

// Global MQTT client
let mqttClient: mqtt.MqttClient | null = null;

// Connect to the database
connect();

// Initialize MQTT connection if not already done
function initializeMqttConnection() {
    if (!mqttClient) {
        mqttClient = mqtt.connect(process.env.MQTT_URL);

        mqttClient.on('connect', () => {
            console.log('Connected to MQTT Broker');
            const topics = generateTopics();
            mqttClient?.subscribe(topics, { qos: 1 }, (err) => {
                if (err) {
                    console.error('Failed to subscribe:', err);
                } else {
                    console.log('Subscribed to all sensor topics');
                }
            });
        });

        // Handle incoming MQTT messages
        mqttClient.on('message', async (topic, message) => {
            console.log('Received topic:', topic);
            console.log('Message:', message.toString());

            try {
                const parsedData = JSON.parse(message.toString());
                const [sourceName, sensorType, sensorName] = topic.split('/'); // Parse topic

                // Define the update object dynamically based on sensor type
                let update = {};
                let arrayFilter = [{ 'sensor.name': sensorName }];

                if (sensorType.includes('flowsensor')) {
                    update = {
                        $set: {
                            'flowSensors.$[sensor].flowRate': parsedData.flowRate,
                            'flowSensors.$[sensor].totalWaterFlow': parsedData.totalWaterFlown,
                        },
                    };
                } else if (sensorType.includes('pressuresensor')) {
                    update = {
                        $set: {
                            'pressureSensors.$[sensor].pressure': parsedData.pressure,
                        },
                    };
                } else if (sensorType.includes('valve')) {
                    update = {
                        $set: {
                            'valves.$[sensor].state': parsedData.state || 'closed',
                            'valves.$[sensor].percentageOpen': parsedData.percentageOpen || 0,
                        },
                    };
                } else {
                    console.error('Unknown sensor type:', sensorType);
                    return; // Exit if the sensor type is not recognized
                }

                // Execute the atomic MongoDB update operation
                const result = await Source.updateOne(
                    { name: sourceName }, // Match source by name
                    update,               // Update the specific sensor
                    {
                        arrayFilters: arrayFilter, // Apply filter for sensor name
                        upsert: true,              // Create new document if not found
                    }
                );

                if (result.modifiedCount > 0) {
                    console.log(`Updated ${sensorType} - ${sensorName} for source ${sourceName}`);
                } else if (result.upsertedCount > 0) {
                    console.log(`Created new entry for source ${sourceName} with ${sensorType} - ${sensorName}`);
                } else {
                    console.log(`No changes made for source ${sourceName}`);
                }
            } catch (error) {
                console.error('Failed to process MQTT message:', error);
            }
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email, password } = reqBody;
        console.log(reqBody);

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 });
        }

        // Check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid Password" }, { status: 400 });
        }

        // Create token data
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email,
        };
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "1hr" });

        // Initialize MQTT connection after successful login
        initializeMqttConnection();

        // Prepare response
        const response = NextResponse.json({
            message: "Login Successful",
            success: true,
        });
        response.cookies.set("token", token, {
            httpOnly: true,
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Generate topics dynamically
function generateTopics() {
    const sources = 10;
    const sensorsPerType = 30;
    const types = ['flowsensor/flow', 'pressuresensor/pressure', 'valve/valve'];

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
