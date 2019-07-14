import { Request, Response, NextFunction } from 'express';
import { Access, withAccess, withTransactionalAccess, IsolationLevel } from './sqlServer';

export default function asyncMiddleware(task: (req: Request) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve()
      .then(() => task(req))
      .then(result => (console.log(req.method.yellow.bold, req.url, 'OK'.green.bold), res.json({ value: result })))
      .catch(reason => (console.log(req.method.yellow.bold, req.url, 'Error'.red.bold), /* next(reason) */ res.json({ message: String(reason) })));
  };
}

export function withAccessMiddleware(task: (access: Access) => Promise<unknown>) {
  return asyncMiddleware(req => withAccess(req, task));
}

export function withTransactionalAccessMiddleware(task: (access: Access) => Promise<unknown>, isolationLevel: IsolationLevel = IsolationLevel.RepeatableRead) {
  return asyncMiddleware(req => withTransactionalAccess(req, task, isolationLevel));
}

//////////////////////////////////////////////////////////////////////////////////////////

// router.post(
//   'api',
//   withAccessMiddleware(async ({ req, types, runQuery, runSp }) => {
//     const data = req.body.data;
//     await runQuery('SELECT @data', { name: 'data', type: types.Numeric, value: data });
//     await runSp('MySP');
//     return await runQuery('SELECT 1');
//   })
// );

// router.post(
//   'api',
//   withTransactionalAccessMiddleware(async ({ req, types, runQuery, runSp }) => {
//     const data = req.body.data;
//     await runQuery('SELECT @data', { name: 'data', type: types.Numeric, value: data });
//     await runSp('MySP');
//     return await runQuery('SELECT 1');
//   })
// );
