import { Router } from 'express';

import MasterDataService from './service/master-data-service';
import PreplanService from './service/preplan-service';

let router = Router();
export default router;

router.use('/MasterData', MasterDataService);
router.use('/Preplan', PreplanService);

/**
 * Serves the environment name, either one of 'production', 'test' or 'development'.
 */
router.get('/env', (req, res, next) => {
  res.json(req.app.get('env'));
});
