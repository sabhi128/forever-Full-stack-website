import mongoose from "mongoose";

// Cache connection for serverless environments
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // If already connected, return existing connection
    if (cached.conn) {
        console.log("Using cached DB connection");
        return cached.conn;
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error("MONGODB_URI environment variable is not set!");
        throw new Error("MONGODB_URI environment variable is not set");
    }

    console.log("Attempting to connect to MongoDB...");

    // If connection is in progress, wait for it
    if (!cached.promise) {
        const opts = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        mongoose.connection.on('connected', () => {
            console.log("DB Connected successfully");
        });

        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
        });

        cached.promise = mongoose.connect(`${MONGODB_URI}/e-commerce`, opts)
            .then((mongoose) => {
                console.log("MongoDB connection established");
                return mongoose;
            })
            .catch((err) => {
                console.error("MongoDB connection failed:", err.message);
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

export default connectDB;
