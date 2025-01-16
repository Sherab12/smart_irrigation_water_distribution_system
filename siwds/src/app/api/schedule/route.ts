const express = require('express');
const mqtt = require('mqtt');
const router = express.Router();

// MQTT Broker configuration
const client = mqtt.connect(process.env.MQTT_URL);

client.on('connect', () => {
    console.log("Connected to MQTT Broker");
});

// API to handle schedule updates
router.post('/schedule', (req, res) => {
    const { sourceName, sensorName, schedule } = req.body;

    if (!sourceName || !sensorName || !schedule) {
        return res.status(400).send({ error: "Invalid input" });
    }

    // Extract the valve ID from the flow sensor ID (assuming naming convention maps directly)
    const valveId = sensorName.replace('flow', 'valve'); // e.g., flow1 -> valve1

    // Publish the schedule to the associated valve
    const topic = `action/valve/${valveId}`;
    const payload = JSON.stringify({
        source: sourceName,
        startTime: schedule.startTime,
        duration: schedule.duration,
        volume: schedule.volume,
    });

    client.publish(topic, payload, (err) => {
        if (err) {
            console.error("Failed to publish schedule:", err);
            return res.status(500).send({ error: "Failed to publish schedule" });
        }

        console.log(`Schedule published to ${topic}:`, payload);
        res.send({ success: true, topic, payload });
    });
});

module.exports = router;
