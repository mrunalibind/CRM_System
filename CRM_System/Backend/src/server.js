import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool } from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import enquiryRouter from "./routes/enquiry.route.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRouter);
app.use("/api/enquiries", enquiryRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async() => {
    pool.connect()
    .then(() => {
        console.log('Connected to the database');   
    })
    .catch((err) => {
        console.error('Error connecting to the database', err);
    });
  console.log(`Server is running on port ${PORT}`);
});