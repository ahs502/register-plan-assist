import { MongoClient, Db } from 'mongodb';
import config from '../config';
import asyncMiddleware from './asyncMiddleware';

export function database<T = any>(task: (db: Db) => T | Promise<T>): Promise<T> {
  return MongoClient.connect(config.mongodbUrl, { useNewUrlParser: true }).then(client => {
    let db = client.db(config.mongodbDatabase);
    return new Promise<T>((resolve, reject) => {
      try {
        resolve(task(db));
      } catch (error) {
        reject(error);
      }
    }).then(
      result => {
        client.close();
        return result;
      },
      reason => {
        client.close();
        return Promise.reject(reason);
      }
    );
  });
}

export function asyncDatabaseMiddleware<T = any>(task: (data: any, db: Db) => T | Promise<T>) {
  return asyncMiddleware(data => database(db => task(data, db)));
}
