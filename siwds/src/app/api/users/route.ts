import { NextResponse } from 'next/server';
import mqtt from 'mqtt';

const mqttClient = mqtt.connect('mqtt://broker.hivemq.com'); // Connect to the MQTT broker

const topic = 'smart_irrigation/flow';
let flowRate = 0;

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
      flowRate = data.flowRate; // Update the flow rate value
      console.log('Received flow rate:', flowRate);
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  }
});

// Named export for GET method (required by Next.js 13+ App Router)
export async function GET() {
  return NextResponse.json({ flowRate }); // Respond with the current flow rate
}
