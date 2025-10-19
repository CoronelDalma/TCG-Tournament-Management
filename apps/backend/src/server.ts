// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes);

export default app;
