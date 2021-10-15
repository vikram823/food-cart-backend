import express from "express";
import { PORT, DB_URL } from "./config";
import errorHandler from "./middleware/errorHandler";
import routes from "./routes";
import mongoose from "mongoose";
import path from "path";
import cors from "cors";


const app = express();

const corsOption = {
  credentials: true,
  origin: ["http://localhost:3000"],
};

app.use(cors(corsOption));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

global.appRoot = path.resolve(__dirname);

// <---------------------------------------- connection ---------------------------------------------->

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected ssuccessfully");
});

// <-------------------------------------------------------------------------------------------------->

app.use("/api", routes);
app.use("/uploads", express.static("uploads"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
