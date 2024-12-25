import mqtt from 'mqtt';
import { sources } from 'next/dist/compiled/webpack/webpack';

const mqttClient = mqtt.connect(process.env.MQTT_URL); // Replace with your IP and port

// MQTT connection and dynamic subscription
    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
    });

    mqttClient.on('message', (receivedTopic, message) => {
        try {
        const data = JSON.parse(message.toString());
        const [source, sensor] = receivedTopic.split('/').slice(1);
        if (sources[source] && sources[source][sensor]) {
            sources[source][sensor].flowRate = data.flowRate;
            sources[source][sensor].totalWaterFlow = data.totalWaterFlow;
            console.log(
            `Received data for Source: ${source}, Sensor: ${sensor} - Flow Rate: ${data.flowRate}, Total Water Flow: ${data.totalWaterFlow}`
            );
        }
        } catch (error) {
        console.error('Error parsing MQTT message:', error);
        }
    });