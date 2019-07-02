import { Request, Response, NextFunction } from 'express';
import { Db, ClientSession } from 'mongodb';
import { withDatabase, withTransaction } from './storage';

export default function asyncMiddleware(task: (data: any) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve()
      .then(() => task(req.body))
      .then(result => (console.log(req.method.yellow.bold, req.url, 'OK'.green.bold), res.json({ value: result })))
      .catch(reason => (console.log(req.method.yellow.bold, req.url, 'Error'.red.bold), /* next(reason) */ res.json({ message: String(reason) })));
  };
}

export function asyncMiddlewareWithDatabase<T = any>(task: (db: Db, data: any) => T | Promise<T>) {
  return asyncMiddleware(data => withDatabase(db => task(db, data)));
}

export function asyncMiddlewareWithTransaction<T = any>(task: (db: Db, session: ClientSession, data: any) => T | Promise<T>) {
  return asyncMiddleware(data => withTransaction((db, session) => task(db, session, data)));
}
