import mongoose, { Schema, model, models } from 'mongoose';

// Define schemas for different sensor types
const flowSensorSchema = new Schema({
  name: { type: String, required: true },
  flowRate: { type: Number, default: 0 }, // Flow rate (e.g., liters per second)
  totalWaterFlow: { type: Number, default: 0 }, // Total water flow (e.g., liters)
}, { timestamps: true });

const pressureSensorSchema = new Schema({
  name: { type: String, required: true },
  pressure: { type: Number, default: 0 }, // Pressure (e.g., in Pascals or bars)
}, { timestamps: true });

const valveSchema = new Schema({
  name: { type: String, required: true },
  state: {
    type: String,
    enum: ['open', 'closed', 'partial'], // Valve state
    default: 'closed',
  },
  percentageOpen: { type: Number, default: 0 }, // Percentage open (e.g., 0 to 100)
}, { timestamps: true });

// Main source schema
const sourceSchema = new Schema({
  name: { type: String, unique: true, required: true }, // Unique name for the source
  flowSensors: [flowSensorSchema], // Array of flow sensors
  pressureSensors: [pressureSensorSchema], // Array of pressure sensors
  valves: [valveSchema], // Array of valves
}, { timestamps: true });

const Source = models.Source || model('Source', sourceSchema);

export default Source;
