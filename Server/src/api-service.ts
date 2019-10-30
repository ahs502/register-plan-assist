import { Router } from 'express';

import ConfigService from './services/config-service';
import OauthService from './services/oauth-service';
import MasterDataService from './services/master-data-service';
import PreplanService from './services/preplan-service';
import FlightRequirementService from './services/flight-requirement-service';
import FlightService from './services/flight-service';

let router = Router();
export default router;

router.use('/config', ConfigService);
router.use('/oauth', OauthService);
router.use('/master-data', MasterDataService);
router.use('/preplan', PreplanService);
router.use('/flight-requirement', FlightRequirementService);
router.use('/flight', FlightService);
