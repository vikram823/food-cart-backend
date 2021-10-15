import dotenv from "dotenv";

dotenv.config();

export const { PORT, DEBUG_MODE, DB_URL, JWT_SECRET, JWT_REF_SECRET, APP_URL} = process.env;
 