import { Router } from 'express';

import PreplanService from './service/preplan-service';
import MasterDataService from './service/master-data-service';

let router = Router();
export default router;

router.use('/PreplanService', PreplanService);
router.use('/MasterDataService', MasterDataService);

/**
 * Serves the environment name, either one of 'production', 'test' or 'development'.
 */
router.get('/env', (req, res, next) => {
  res.json(req.app.get('env'));
});
