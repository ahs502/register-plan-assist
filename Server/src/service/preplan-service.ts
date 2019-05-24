import { Router } from 'express';

const router = Router();
export default router;

router.post('/create-empty-preplan', (req, res, next) => {
  const name: string = req.body.name;
  const startDate: Date = new Date(req.body.startDate);
  const endDate: Date = new Date(req.body.endDate);

  // make that empty preplan...

  res.json('12345489');
});

router.post('/clone-preplan', (req, res, next) => {
  const parentPreplanId: string = req.body.parentPreplanId;
  const name: string = req.body.name;
  const startDate: Date = new Date(req.body.startDate);
  const endDate: Date = new Date(req.body.endDate);

  // make that cloned preplan...

  res.json('12345489');
});
