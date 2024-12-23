import { NextResponse } from 'next/server';
import mqtt from 'mqtt';

const mqttClient = mqtt.connect('mqtt://192.168.0.152:1883'); // Replace with your laptop's IP address and port

const topic = 'smart_irrigation/flow';
let flowRate = 0;
let totalWaterFlow = 0;  // Variable to store total water flow

// Connect to the MQTT broker and subscribe to the relevant topic
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe(topic, (err) => {
    if (!err) {
      console.log('Subscribed to topic:', topic);
    } else {
      console.error('Subscription error:', err);
    }
  });
});

// Handle incoming messages from the broker
mqttClient.on('message', (receivedTopic, message) => {
  if (receivedTopic === topic) {
    try {
      const data = JSON.parse(message.toString());
      flowRate = data.flowRate;  // Update the flow rate value
      totalWaterFlow = data.totalWaterFlow;  // Update the total water flow value
      console.log('Received flow rate:', flowRate, 'Total water flow:', totalWaterFlow);
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  }
});

// Named export for GET method (required by Next.js 13+ App Router)
export async function GET() {
  return NextResponse.json({ flowRate, totalWaterFlow });  // Respond with flow rate and total water flow
}
