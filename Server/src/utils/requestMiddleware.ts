import { Request, Response, NextFunction } from 'express';
import { DbAccess, withDbAccess, withTransactionalDbAccess, IsolationLevel } from './sqlServer';
import AuthenticationHeaderModel from '@core/models/authentication/AuthenticationHeaderModel';
import { cryptr } from './oauth';
import ServerResult from '@core/types/ServerResult';

export default function requestMiddleware<B extends {}, R>(task: (userId: string, body: B) => Promise<R>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const encodedAuthenticationHeader = req.headers['Authentication'] as string | undefined;
      if (!encodedAuthenticationHeader) throw 'No authentication';

      const authenticationHeader: AuthenticationHeaderModel = JSON.parse(cryptr.decrypt(encodedAuthenticationHeader));
      if (authenticationHeader.ip !== req.ip) throw 'Unmatched IP';
      if (authenticationHeader.userAgent !== req.headers['user-agent']) throw 'Unmatched user-agent';
      if (Date.parse(authenticationHeader.expiresAt) < Date.now()) throw 'Seasion expired';

      const userId = authenticationHeader.userId;

      try {
        const result = await task(userId, req.body);
        console.log(req.method.yellow.bold, req.url, 'OK'.green.bold);
        const serverResult: ServerResult<R> = { value: result };
        res.json(serverResult);
      } catch (reason) {
        console.log(req.method.yellow.bold, req.url, 'Error'.red.bold);
        const serverResult: ServerResult<R> = { message: String(reason) };
        res.json(serverResult);
      }
    } catch (authenticationFailureReason) {
      console.error(req.method.yellow.bold, req.url, 'Unauthorized (401)'.red, String(authenticationFailureReason).red.bold);
      res.status(401).end();
    }
  };
}

export function requestMiddlewareWithDbAccess<B extends {}, R>(task: (userId: string, body: B, dbAccess: DbAccess) => Promise<R>) {
  return requestMiddleware<B, R>((userId, body) => withDbAccess(dbAccess => task(userId, body, dbAccess)));
}

export function requestMiddlewareWithTransactionalDbAccess<B extends {}, R>(
  task: (userId: string, body: B, dbAccess: DbAccess) => Promise<R>,
  isolationLevel: IsolationLevel = IsolationLevel.RepeatableRead
) {
  return requestMiddleware<B, R>((userId, body) => withTransactionalDbAccess(dbAccess => task(userId, body, dbAccess), isolationLevel));
}
