
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import userRoutes from '@presentation/user/routes/user.routes';
import otpRoutes from '@presentation/otp/routes/otp.routes';
import passwordResetRoutes from '@presentation/passwordReset/routes/passwordReset.routes';
import adminRoutes from '@presentation/admin/routes/admin.routes';
import { errorHandler } from '@shared/middlewares/errorHandler';
import { env } from '@config/env';

const app: Express = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

export default app;
