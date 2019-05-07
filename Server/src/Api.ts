import { Router } from 'express';

const router = Router();
export default router;

router.get('/', (req, res, next) => {
  res.json({
    data: req.app.get('env')
  });
});
