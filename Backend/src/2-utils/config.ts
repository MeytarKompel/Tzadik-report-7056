import dotenv from "dotenv";

dotenv.config();

class Config {
    public connectionString = process.env.MONGO_URI as string;
    public port = Number(process.env.PORT) || 3001;
}

const config = new Config();
export default config;