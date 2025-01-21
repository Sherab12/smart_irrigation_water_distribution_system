import mongoose from 'mongoose';

const FieldSchema = new mongoose.Schema({
    fieldName: { type: String, required: true },
    fieldSize: { type: String, required: true },
    flowSensor: { type: String, required: true },
    valve: { type: String, required: true },
    source: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Field || mongoose.model('Field', FieldSchema);
