import { Router } from 'express';

import MasterDataService from './services/master-data-service';
import PreplanService from './services/preplan-service';

let router = Router();
export default router;

router.use('/master-data', MasterDataService);
router.use('/preplan', PreplanService);

/**
 * Serves the environment name, either one of 'production', 'test' or 'development'.
 */
router.get('/env', (req, res, next) => {
  res.json(req.app.get('env'));
});
