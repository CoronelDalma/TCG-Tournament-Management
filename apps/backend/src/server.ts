// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes'
import tournamentRouter from './routes/tournamentRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRouter);

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

export default app;
