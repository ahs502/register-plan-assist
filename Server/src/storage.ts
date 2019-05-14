import { MongoClient, Db } from 'mongodb';

const config = require('../config');

export function database<T>(task: (db: Db) => T | Promise<T>): Promise<T> {
  return MongoClient.connect(config.mongodbUrl).then(client => {
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
