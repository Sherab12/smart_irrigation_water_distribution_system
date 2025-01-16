import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  sourceName: string;
  sensorName: string;
  startTime: string;
  endTime: string;
  duration: number;
  volume: number;
  progress: string;
}

const ScheduleSchema: Schema = new Schema(
  {
    sourceName: { type: String, required: true },
    sensorName: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    volume: { type: Number, required: true }, // Volume in liters
    progress: { type: String, required: true, enum: ['Scheduled', 'Running', 'Completed'] },
  },
  { timestamps: true }
);

export default mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);
