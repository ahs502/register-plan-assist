import { Router } from 'express';

import MasterDataService from './services/master-data-service';
import PreplanService from './services/preplan-service';
import ConfigService from './services/config-service';
import OauthService from './services/oauth-service';

let router = Router();
export default router;

router.use('/master-data', MasterDataService);
router.use('/preplan', PreplanService);
router.use('/config', ConfigService);
router.use('/oauth', OauthService);
