import { connect } from "@/dbConfig/db";
import User from "@/models/userModels";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import mqtt from 'mqtt';
import Source from "@/models/source";

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

    // Handle incoming MQTT messages
mqttClient.on('message', async (topic, message) => {
    console.log('Received topic:', topic);
    console.log('Message:', message.toString());
    try {
      const parsedData = JSON.parse(message.toString());
      await connect();
  
      const [sourceName, sensorType, sensorName] = topic.split('/');
      const sensorId = sensorName; // e.g., flow1, pressure1, valve1
  
      // Find or create the source
      let source = await Source.findOne({ name: sourceName });
      if (!source) {
        source = new Source({ name: sourceName });
      }
  
      // Update the appropriate sensor data
      if (sensorType.includes('flowsensor')) {
        const flowSensor = source.flowSensors.find((sensor) => sensor.name === sensorId);
        if (flowSensor) {
          flowSensor.flowRate = parsedData.flowRate;
          flowSensor.totalWaterFlow = parsedData.totalWaterFlown;
        } else {
          source.flowSensors.push({
            name: sensorId,
            flowRate: parsedData.flowRate,
            totalWaterFlow: parsedData.totalWaterFlown,
          });
        }
      } else if (sensorType.includes('pressuresensor')) {
        const pressureSensor = source.pressureSensors.find((sensor) => sensor.name === sensorId);
        if (pressureSensor) {
          pressureSensor.pressure = parsedData.pressure;
        } else {
          source.pressureSensors.push({
            name: sensorId,
            pressure: parsedData.pressure,
          });
        }
      } else if (sensorType.includes('valve')) {
        const valve = source.valves.find((sensor) => sensor.name === sensorId);
        if (valve) {
          valve.state = parsedData.state || 'closed';
          valve.percentageOpen = parsedData.percentageOpen || 0;
        } else {
          source.valves.push({
            name: sensorId,
            state: parsedData.state || 'closed',
            percentageOpen: parsedData.percentageOpen || 0,
          });
        }
      }
  
      // Save the updated source to the database
      await source.save();
      console.log('Sensor data saved to MongoDB');
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
