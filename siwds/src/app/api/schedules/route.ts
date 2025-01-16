import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import Schedule from '@/models/schedules';

// Ensure database connection
connect();

// POST handler - to create a new schedule
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { sourceName, sensorName, startTime, endTime, duration, volume, progress } = body;

        // Validate the required fields
        if (!sourceName || !sensorName || !startTime || !endTime || !duration || !volume || !progress) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Create and save the schedule
        const schedule = new Schedule({
        sourceName,
        sensorName,
        startTime,
        endTime,
        duration,
        volume,
        progress,
        });
        await schedule.save();

        return NextResponse.json({ message: 'Schedule created successfully', schedule }, { status: 201 });
    } catch (error) {
        console.error('Error creating schedule:', error);
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}

// GET handler - to retrieve all schedules
export async function GET(req: NextRequest) {
    try {
        // Fetch all schedules from the database
        const schedules = await Schedule.find();

        return NextResponse.json({ schedules }, { status: 200 });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}

// DELETE handler - to delete a specific schedule
export async function DELETE(req: NextRequest) {
        try {
        const { searchParams } = new URL(req.url);
        const sourceName = searchParams.get('sourceName');
        const sensorName = searchParams.get('sensorName');
    
        if (!sourceName || !sensorName) {
            return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
        }
    
        // Find and delete the schedule
        const deletedSchedule = await Schedule.findOneAndDelete({ sourceName, sensorName });
    
        if (!deletedSchedule) {
            return NextResponse.json({ message: 'Schedule not found' }, { status: 404 });
        }
    
        return NextResponse.json({ message: 'Schedule deleted successfully' }, { status: 200 });
        } catch (error) {
        console.error('Error deleting schedule:', error);
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
        }
}  