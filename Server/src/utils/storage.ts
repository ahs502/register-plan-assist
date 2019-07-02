import { MongoClient, Db, ClientSession } from 'mongodb';
import config from '../config';
import asyncMiddleware from './asyncMiddleware';

export async function withDatabase<T = any>(task: (db: Db) => T | Promise<T>): Promise<T> {
  const client = await MongoClient.connect(config.mongodbUrl, { useNewUrlParser: true });
  const db = client.db(config.mongodbDatabase);
  try {
    const result = await new Promise<T>((resolve, reject) => {
      try {
        resolve(task(db));
      } catch (error) {
        reject(error);
      }
    });
    client.close();
    return result;
  } catch (reason) {
    client.close();
    return Promise.reject(reason);
  }
}

export async function withTransaction<T = any>(task: (db: Db, session: ClientSession) => T | Promise<T>): Promise<T> {
  console.warn('Transactions are not implemented for MongoDB yet.'); //TODO: Transactions are not implemented for MongoDB yet. This is one of the hell holes. DO NOT TRY TO FIX IT. See: https://github.com/vkarpov15/run-rs#readme
  return await withDatabase(db => task(db, undefined));

  // const client = await MongoClient.connect(config.mongodbUrl, { useNewUrlParser: true });
  // const db = client.db(config.mongodbDatabase);
  // const session = client.startSession();
  // session.startTransaction();
  // try {
  //   const result = await new Promise<T>((resolve, reject) => {
  //     try {
  //       resolve(task(db, session));
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  //   await session.commitTransaction();
  //   session.endSession();
  //   client.close();
  //   return result;
  // } catch (reason) {
  //   await session.abortTransaction();
  //   session.endSession();
  //   client.close();
  //   return Promise.reject(reason);
  // }
}
