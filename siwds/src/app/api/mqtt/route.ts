import { NextApiRequest, NextApiResponse } from 'next';
import mqtt from 'mqtt';
import { NextResponse } from 'next/server';

// Set up the MQTT client to connect to the broker
const mqttClient = mqtt.connect(process.env.MQTT_URL || 'mqtt://192.168.0.152:1883');

// Store sensor data temporarily (in-memory)
const sensorData: Record<string, any> = {};

// MQTT connection and subscriptions
mqttClient.on('connect', () => {
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
mqttClient.on('message', (topic, message) => {
  console.log('Received topic:', topic);
  console.log('Message:', message.toString());
  try {
    sensorData[topic] = JSON.parse(message.toString());
  } catch (error) {
    console.error('Failed to parse MQTT message:', error);
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

// Handle the GET method
export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source');
  const sensorType = searchParams.get('sensorType');
  const sensorId = searchParams.get('sensorId');

  // Validate query parameters
  if (!source || !sensorType || !sensorId) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters. Ensure "source", "sensorType", and "sensorId" are provided.',
      },
      { status: 400 }
    );
  }

  // Correct key construction
  const key = `${source}/${sensorType}/${sensorId}`;

  // Return the data or 404 if not found
  if (sensorData[key]) {
    return NextResponse.json({ [key]: sensorData[key] });
  } else {
    return NextResponse.json(
      { error: `Data not found for ${key}` },
      { status: 404 }
    );
  }
};

// Handle the POST method (if needed)
export const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(405).json({ error: 'POST method not allowed on this route' });
};

// Other methods (HEAD, OPTIONS, etc.)
export const HEAD = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).end();
};

export const OPTIONS = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Allow', 'GET, POST, HEAD, OPTIONS').end();
};
