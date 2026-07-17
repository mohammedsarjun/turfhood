import cors from 'cors';
import express, { type Express } from 'express';
import userRoutes from '@presentation/user/routes/user.routes';
import { errorHandler } from '@shared/middlewares/errorHandler';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.use(errorHandler);

export default app;
