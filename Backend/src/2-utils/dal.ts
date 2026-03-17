import mongoose from "mongoose";
import config from "./config";

class Dal {
    public async connect(): Promise<void> {
        try {
            await mongoose.connect(config.connectionString);
            console.log("Connected to MongoDB Atlas");
        } catch (err: any) {
            console.error("MongoDB connection failed:", err.message);
            throw err;
        }
    }
}

const dal = new Dal();

export default dal;