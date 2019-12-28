import { Request, Response, NextFunction } from 'express';
import { Db, withDb, withTransactionalDb, IsolationLevel } from './sqlServer';
import AuthenticationHeaderModel from '@core/models/authentication/AuthenticationHeaderModel';
import { cryptr } from './oauth';
import ServerResult from '@core/types/ServerResult';
import Id from '@core/types/Id';

export default function requestMiddleware<B extends {}, R>(task: (userId: Id, body: B) => Promise<R>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const encodedAuthenticationHeader = req.headers['authentication'] as string | undefined; // Apparently, express makes all header keys lower-case.
      if (!encodedAuthenticationHeader) throw 'No authentication';

      const authenticationHeader: AuthenticationHeaderModel = JSON.parse(cryptr.decrypt(encodedAuthenticationHeader));
      if (authenticationHeader.ip !== req.ip) throw 'Unmatched IP';
      if (authenticationHeader.userAgent !== req.headers['user-agent']) throw 'Unmatched user-agent';
      if (Date.parse(authenticationHeader.expiresAt) < Date.now()) throw 'Seasion expired';

      const userId = authenticationHeader.userId;

      try {
        const result = await task(userId, req.body);
        console.log(req.method.yellow.bold, req.originalUrl, 'OK'.green.bold);
        const serverResult: ServerResult<R> = { value: result };
        res.json(serverResult);
      } catch (reason) {
        console.log(req.method.yellow.bold, req.originalUrl, 'Error'.red.bold);
        const serverResult: ServerResult<R> = { message: String(reason) };
        res.json(serverResult);
      }
    } catch (authenticationFailureReason) {
      console.error(req.method.yellow.bold, req.originalUrl, 'Unauthorized (401)'.red, String(authenticationFailureReason).red.bold);
      res.status(401).end();
    }
  };
}

export function requestMiddlewareWithDb<B extends {}, R>(task: (userId: Id, body: B, db: Db) => Promise<R>) {
  return requestMiddleware<B, R>((userId, body) => withDb(db => task(userId, body, db)));
}

export function requestMiddlewareWithTransactionalDb<B extends {}, R>(
  task: (userId: Id, body: B, db: Db) => Promise<R>,
  isolationLevel: IsolationLevel = IsolationLevel.RepeatableRead
) {
  return requestMiddleware<B, R>((userId, body) => withTransactionalDb(db => task(userId, body, db), isolationLevel));
}
