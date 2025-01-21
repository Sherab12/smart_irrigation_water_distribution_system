import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import Field from '@/models/Field';

export async function POST(req: NextRequest) {
    try {
        await connect(); // Connect to the database
        const body = await req.json();

        const { fieldName, fieldSize, flowSensor, valve, source } = body;

        // Validation for required fields
        if (!fieldName || !fieldSize || !flowSensor || !valve || !source) {
        return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        // Create and save the new field
        const newField = new Field({
        fieldName,
        fieldSize,
        flowSensor,
        valve,
        source,
        });
        await newField.save();

        return NextResponse.json({ success: true, message: 'Field added successfully.' }, { status: 201 });
    } catch (error) {
        console.error('Error saving field:', error);
        return NextResponse.json({ success: false, message: 'Failed to save field.', error: error.message }, { status: 500 });
    }
}
