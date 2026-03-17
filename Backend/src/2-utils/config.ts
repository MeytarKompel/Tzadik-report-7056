import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

class Config {
    public connectionString = process.env.MONGO_URI as string;
    public port = Number(process.env.PORT) || 3001;
}

const config = new Config();
export default config;