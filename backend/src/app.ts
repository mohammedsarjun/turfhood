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
import commissionRoutes from '@presentation/commission/routes/commission.routes';
import bookingRoutes from '@presentation/booking/routes/booking.routes';
import paymentRoutes from '@presentation/booking/routes/payment.routes';
import ownerBookingRoutes from '@presentation/booking/routes/ownerBooking.routes';
import reviewRoutes from '@presentation/review/routes/review.routes';
import favoriteRoutes from '@presentation/favorite/routes/favorite.routes';
import { errorHandler } from '@shared/middlewares/errorHandler';
import { env } from '@config/env';

const app: Express = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/commission', commissionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/turf-portal/:turfId/bookings', ownerBookingRoutes);
app.use('/api', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/sports', sportsTypeRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/turf-owner-applications', turfOwnerApplicationRoutes);
app.use('/api/turfs/:turfId/courts', courtRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/turfs', turfRoutes);

app.use(errorHandler);

export default app;
