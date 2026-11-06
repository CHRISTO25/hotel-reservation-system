import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import reservationRoutes from './routes/reservationRoutes';


dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  });
}

export default app;