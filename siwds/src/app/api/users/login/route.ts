import { connect } from "@/dbConfig/db";
import User from "@/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import mqtt from 'mqtt';

// Connect to the database
connect();

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

        // Trigger MQTT connection after successful login
        triggerMqttConnection();

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

// Function to trigger the MQTT connection
function triggerMqttConnection() {
    const mqttClient = mqtt.connect(process.env.MQTT_URL);

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT Broker');
        const topics = generateTopics();
        mqttClient.subscribe(topics, { qos: 1 }, (err) => {
        if (err) {
            console.error('Failed to subscribe:', err);
        } else {
            console.log('Subscribed to all sensor topics');
        }
        });
    });

    mqttClient.on('message', async (topic, message) => {
        // Your existing MQTT message handling logic
        console.log('Received topic:', topic);
        console.log('Message:', message.toString());
        try {
        const parsedData = JSON.parse(message.toString());
        // Database handling logic for storing sensor data
        // Your logic for processing the sensor data goes here
        } catch (error) {
        console.error('Failed to parse or store MQTT message:', error);
        }
    });
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
