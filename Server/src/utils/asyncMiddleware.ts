import { Request, Response, NextFunction } from 'express';

export default function asyncMiddleware(handler: (data: any) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req.body))
      .then(result => res.json(result))
      .catch(next);
  };
}
