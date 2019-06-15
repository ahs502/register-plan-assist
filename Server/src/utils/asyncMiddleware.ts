import { Request, Response, NextFunction } from 'express';

export default function asyncMiddleware(handler: (data: any) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve()
      .then(() => handler(req.body))
      .then(result => (console.log(req.method.yellow.bold, req.url, 'OK'.green.bold), res.json({ value: result })))
      .catch(reason => (console.log(req.method.yellow.bold, req.url, 'Error'.red.bold), /* next(reason) */ res.json({ message: String(reason) })));
  };
}
