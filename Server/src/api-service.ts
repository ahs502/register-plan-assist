import { Router } from 'express';

import configService from 'src/services/config-service';
import oauthService from 'src/services/oauth-service';
import masterDataService from 'src/services/master-data-service';
import preplanHeaderService from 'src/services/preplan-header-service';
import preplanService from 'src/services/preplan-service';
import flightRequirementService from 'src/services/flight-requirement-service';
import flightService from 'src/services/flight-service';

let router = Router();
export default router;

router.use('/config', configService);
router.use('/oauth', oauthService);
router.use('/master-data', masterDataService);
router.use('/preplan-header', preplanHeaderService);
router.use('/preplan', preplanService);
router.use('/flight-requirement', flightRequirementService);
router.use('/flight', flightService);
