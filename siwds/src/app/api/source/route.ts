import { connect } from '../../../dbConfig/db';
import Source from '../../../models/source';
import { NextResponse } from 'next/server';

// API route for adding a source and its sensors
export async function POST(req: Request) {
  await connect();

  try {
    const { sourceName, flowSensors, pressureSensors, valves } = await req.json();

    if (!sourceName) {
      return NextResponse.json(
        { error: 'Source name is required' },
        { status: 400 }
      );
    }

    const existingSource = await Source.findOne({ name: sourceName });

    if (!existingSource) {
      // Map sensors and valves to match the schema
      const flowSensorObjects = flowSensors?.map((sensor: string) => ({
        name: sensor,
        flowRate: 0,
        totalWaterFlow: 0,
      })) || [];

      const pressureSensorObjects = pressureSensors?.map((sensor: string) => ({
        name: sensor,
        pressure: 0,
      })) || [];

      const valveObjects = valves?.map((valve: string) => ({
        name: valve,
        state: 'closed',
        percentageOpen: 0,
      })) || [];

      // Create and save a new source with sensors
      const newSource = new Source({
        name: sourceName,
        flowSensors: flowSensorObjects,
        pressureSensors: pressureSensorObjects,
        valves: valveObjects,
      });

      await newSource.save();
    }

    return NextResponse.json({ success: true, message: 'Source added successfully' });
  } catch (error) {
    console.error('Error adding source:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding the source' },
      { status: 500 }
    );
  }
}

// API route for fetching sensor data
export async function GET(req: Request) {
  await connect();

  const url = new URL(req.url);
  const source = url.searchParams.get("source");
  const sensor = url.searchParams.get("sensor");

  try {
    if (!source && !sensor) {
      // Return all sources with full sensor details
      const allSources = await Source.find();
      const formattedSources = allSources.reduce((acc, source) => {
        acc[source.name] = {
          flowSensors: source.flowSensors,  // ✅ Return full flow sensor objects
          pressureSensors: source.pressureSensors,  // ✅ Return full pressure sensor objects
          valves: source.valves,  // ✅ Return full valve objects
        };
        return acc;
      }, {});
      return NextResponse.json(formattedSources);
    }

    if (!source || !sensor) {
      return NextResponse.json(
        { error: "Please provide both source and sensor parameters" },
        { status: 400 }
      );
    }

    const sourceData = await Source.findOne({ name: source });
    if (!sourceData) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    // Find the correct sensor data based on the sensor name
    const sensorData =
      sourceData.flowSensors.find((s: { name: string; }) => s.name === sensor) ||
      sourceData.pressureSensors.find((s: { name: string; }) => s.name === sensor) ||
      sourceData.valves.find((s: { name: string; }) => s.name === sensor);

    if (!sensorData) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    return NextResponse.json(sensorData);
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sensor data" },
      { status: 500 }
    );
  }
}

// DELETE API: Remove a sensor or valve from a source
export async function DELETE(req: Request) {
  await connect();

  try {
    const { sourceName, sensorName, type } = await req.json();

    if (!sourceName || !sensorName || !type) {
      return NextResponse.json(
        { error: "Source name, sensor name, and type are required" },
        { status: 400 }
      );
    }

    const source = await Source.findOne({ name: sourceName });

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    if (type === "Flow Sensor") {
      source.flowSensors = source.flowSensors.filter((s: any) => s.name !== sensorName);
    } else if (type === "Pressure Sensor") {
      source.pressureSensors = source.pressureSensors.filter((s: any) => s.name !== sensorName);
    } else if (type === "Valve") {
      source.valves = source.valves.filter((s: any) => s.name !== sensorName);
    }

    await source.save();

    return NextResponse.json({ success: true, message: "Sensor/Valve deleted successfully" });
  } catch (error) {
    console.error("Error deleting sensor/valve:", error);
    return NextResponse.json({ error: "Failed to delete sensor/valve" }, { status: 500 });
  }
}

// PUT API: Edit a sensor or valve inside a source
export async function PUT(req: Request) {
  await connect();

  try {
    const { sourceName, oldSensorName, newSensorName, type } = await req.json();

    if (!sourceName || !oldSensorName || !newSensorName || !type) {
      return NextResponse.json(
        { error: "Source name, old sensor name, new sensor name, and type are required" },
        { status: 400 }
      );
    }

    const source = await Source.findOne({ name: sourceName });

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    let sensorList;

    if (type === "Flow Sensor") {
      sensorList = source.flowSensors;
    } else if (type === "Pressure Sensor") {
      sensorList = source.pressureSensors;
    } else if (type === "Valve") {
      sensorList = source.valves;
    }

    const sensor = sensorList.find((s: any) => s.name === oldSensorName);

    if (!sensor) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    sensor.name = newSensorName;
    await source.save();

    return NextResponse.json({ success: true, message: "Sensor/Valve updated successfully" });
  } catch (error) {
    console.error("Error updating sensor/valve:", error);
    return NextResponse.json({ error: "Failed to update sensor/valve" }, { status: 500 });
  }
}
