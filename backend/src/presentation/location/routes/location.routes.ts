import { Router } from 'express';
import { container } from 'tsyringe';
import { LocationController } from '@presentation/location/controllers/LocationController';

const router = Router();
const locationController = container.resolve(LocationController);

router.get('/countries', locationController.listCountries);
router.get('/countries/:countryCode/states', locationController.listStates);
router.get('/countries/:countryCode/states/:stateCode/cities', locationController.listCities);

export default router;
