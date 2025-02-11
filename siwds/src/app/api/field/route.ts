import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import Field from '@/models/Field';

export async function POST(req) {
    try {
        await connect();
        const body = await req.json();
        const { fieldName, fieldSize, flowSensor, valve, source } = body;

        if (!fieldName || !fieldSize || !flowSensor || !valve || !source) {
            return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

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

export async function GET() {
    try {
        await connect();
        const fields = await Field.find({});
        return NextResponse.json({ success: true, data: fields }, { status: 200 });
    } catch (error) {
        console.error('Error fetching fields:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch fields.', error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await connect();
        const body = await req.json();
        const { fieldId, fieldName, fieldSize, flowSensor, valve, source } = body;

        if (!fieldId || !fieldName || !fieldSize || !flowSensor || !valve || !source) {
            return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
        }

        const updatedField = await Field.findByIdAndUpdate(
            fieldId,
            { fieldName, fieldSize, flowSensor, valve, source },
            { new: true }
        );

        if (!updatedField) {
            return NextResponse.json({ success: false, message: 'Field not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Field updated successfully.', data: updatedField });
    } catch (error) {
        console.error('Error updating field:', error);
        return NextResponse.json({ success: false, message: 'Failed to update field.', error: error.message }, { status: 500 });
    }
}


export async function DELETE(req) {
    try {
        await connect();
        const body = await req.json();
        const { fieldId } = body;

        if (!fieldId) {
            return NextResponse.json({ success: false, message: 'Field ID is required.' }, { status: 400 });
        }

        const deletedField = await Field.findByIdAndDelete(fieldId);

        if (!deletedField) {
            return NextResponse.json({ success: false, message: 'Field not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Field deleted successfully.' });
    } catch (error) {
        console.error('Error deleting field:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete field.', error: error.message }, { status: 500 });
    }
}


