import mongoose, { ConnectOptions } from 'mongoose';

const MAX_RETRIES = 5; // Maximum number of retries
const RETRY_DELAY = 5000; // Delay between retries in milliseconds

export async function connect(): Promise<void> {
    let attempts = 0;

    const connectWithRetry = async (): Promise<void> => {
        try {
        const options: ConnectOptions = {}; // Add any required options here
        await mongoose.connect(process.env.MONGODB_URI!, options);

        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        connection.on('error', (err: Error) => {
            console.error('MongoDB connection error:', err);
        });
        } catch (error) {
        attempts += 1;
        console.error(`MongoDB connection failed (Attempt ${attempts}/${MAX_RETRIES}):`, error);

        if (attempts < MAX_RETRIES) {
            console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
            setTimeout(connectWithRetry, RETRY_DELAY);
        } else {
            console.error('Max retries reached. Unable to connect to MongoDB.');
        }
        }
    };

    await connectWithRetry();
}
