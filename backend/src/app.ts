import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import userRoutes from '@presentation/user/routes/user.routes';
import otpRoutes from '@presentation/otp/routes/otp.routes';
import passwordResetRoutes from '@presentation/passwordReset/routes/passwordReset.routes';
import adminRoutes from '@presentation/admin/routes/admin.routes';
import sportsTypeRoutes from '@presentation/sportsType/routes/sportsType.routes';
import amenityRoutes from '@presentation/amenity/routes/amenity.routes';
import turfOwnerApplicationRoutes from '@presentation/turfOwnerApplication/routes/turfOwnerApplication.routes';
import courtRoutes from '@presentation/court/routes/court.routes';
import locationRoutes from '@presentation/location/routes/location.routes';
import bannerRoutes from '@presentation/banner/routes/banner.routes';
import turfRoutes from '@presentation/turf/routes/turf.routes';
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
app.use('/api/sports', sportsTypeRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/turf-owner-applications', turfOwnerApplicationRoutes);
app.use('/api/turfs/:turfId/courts', courtRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/turfs', turfRoutes);

app.use(errorHandler);

export default app;
