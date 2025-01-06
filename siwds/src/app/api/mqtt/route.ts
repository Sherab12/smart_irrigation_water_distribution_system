import { NextApiRequest, NextApiResponse } from 'next';
import mqtt from 'mqtt';
import Source from '@/models/source';
import { connect } from '@/dbConfig/db';


// Set up the MQTT client to connect to the broker
const mqttClient = mqtt.connect(process.env.MQTT_URL || 'mqtt://192.168.0.152:1883');

// MQTT connection and subscriptions
mqttClient.on('connect', async () => {
  console.log('Connected to MQTT Broker');

  // Subscribe to all relevant topics dynamically
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

// Generate topics dynamically for sources and sensors
function generateTopics(): string[] {
  const sources = 10;
  const sensorsPerType = 30;
  const types = ['flowsensor/flow', 'pressuresensor/pressure', 'valve/valve'];

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