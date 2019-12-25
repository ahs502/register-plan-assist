import { Connection, Request as TediousRequest, TYPES, TediousType, ParameterOptions, TediousTypes, ISOLATION_LEVEL } from 'tedious';
import config from 'src/config';
import { Xml } from './xml';

function createConnection() {
  return new Connection({
    server: config.sqlServer.server,
    authentication: {
      type: 'default',
      options: {
        userName: config.sqlServer.username,
        password: config.sqlServer.password
      }
    },
    options: {
      database: config.sqlServer.database,
      rowCollectionOnRequestCompletion: true,
      encrypt: false
    }
  });
}

interface Parameter {
  name: string;
  type: TediousType;
  value: any;
  options?: ParameterOptions;
}
interface TableColumn extends ParameterOptions {
  name: string;
  type: TediousType;
}

function createDb(connection: Connection) {
  const db = {
    types: TYPES,

    param(name: string, type: TediousType, value: any, options?: ParameterOptions): Parameter {
      return { name, type, value, options };
    },
    bitParam(name: string, value: boolean | null): Parameter {
      return { name, type: TYPES.Bit, value };
    },
    intParam(name: string, value: string | number | null): Parameter {
      return { name, type: TYPES.Int, value };
    },
    bigIntParam(name: string, value: bigint | string | null): Parameter {
      return { name, type: TYPES.VarChar, value, options: { length: 30 } }; // Do not use TYPES.BigInt, it does not work with large numbers.
    },
    varCharParam(name: string, value: string | null, length: number | 'max'): Parameter {
      return { name, type: TYPES.VarChar, value, options: { length } };
    },
    nVarCharParam(name: string, value: string | null, length: number | 'max'): Parameter {
      return { name, type: TYPES.NVarChar, value, options: { length } };
    },
    dateTimeParam(name: string, value: Date | string | null, scale?: number): Parameter {
      return { name, type: TYPES.VarChar, value: typeof value === 'string' ? value : value.toJSON(), options: { scale } };
    },
    xmlParam(name: string, value: Xml | null): Parameter {
      return { name, type: TYPES.VarBinary, options: { length: 'max' }, value: value && Buffer.from(value, 'utf-8') }; // Do not use TYPES.Xml or TYPES.NText, tedious does not accept those type for input parameters.
    },

    tableParam(name: string, columns: readonly TableColumn[], rows: readonly any[][]): Parameter {
      return { name, type: TYPES.TVP, value: { columns, rows } };
    },

    column(name: string, type: TediousType, options?: ParameterOptions): TableColumn {
      return { name, type, ...options };
    },
    bitColumn(name: string): TableColumn {
      return { name, type: TYPES.Bit };
    },
    intColumn(name: string): TableColumn {
      return { name, type: TYPES.Int };
    },
    bigIntColumn(name: string): TableColumn {
      return { name, type: TYPES.VarChar, length: 30 }; // Do not use TYPES.BigInt, it does not work with large numbers.
    },
    varCharColumn(name: string, length: number | 'max'): TableColumn {
      return { name, type: TYPES.VarChar, length };
    },
    nVarCharColumn(name: string, length: number | 'max'): TableColumn {
      return { name, type: TYPES.NVarChar, length };
    },
    dateTimeColumn(name: string, scale?: number): TableColumn {
      return { name, type: TYPES.VarChar, scale };
    },
    xmlColumn(name: string): TableColumn {
      return { name, type: TYPES.NVarChar, length: 'max' }; // Do not use TYPES.Xml or TYPES.Text, tedious does not support them as column types of a TVP.
    },

    query<E = any>(query: string, ...parameters: Parameter[]) {
      return makeAccessToResult(
        () =>
          new Promise<E[]>((resolve, reject) => {
            const request = new TediousRequest(query, (error, rowCount, rows) => {
              if (error) return reject(error);
              resolve(getJsonResult(rows));
            });
            parameters.forEach(p => request.addParameter(p.name, p.type, p.value, p.options));
            connection.execSql(request);
          })
      );
    },

    sp<E = any>(sp: string, ...parameters: Parameter[]) {
      return makeAccessToResult(
        () =>
          new Promise<E[]>((resolve, reject) => {
            const request = new TediousRequest(sp, (error, rowCount, rows) => {
              if (error) return reject(error);
              resolve(getJsonResult(rows));
            });
            parameters.forEach(p => request.addParameter(p.name, p.type, p.value, p.options));
            connection.callProcedure(request);
          })
      );
    },

    select<E = any>(selectors?: { [K in keyof E]: string }) {
      return {
        from(source: string) {
          const selection = ((selectors ? Object.keys(selectors) : []) as (keyof E)[]).map(p => `${selectors[p]} as [${p}]`).join(', ');
          return {
            where(condition: string) {
              return db.query<E>(`select ${selection} from ${source} where ${condition};`);
            }
          };
        }
      };
    }
  };

  return db;

  function makeAccessToResult<E>(getData: () => Promise<E[]>) {
    return {
      async all(errorMessage?: string): Promise<E[]> {
        const data = await getData();
        if (errorMessage !== undefined && data.length === 0) throw errorMessage;
        return data;
      },
      async map<T>(mapper: (item: E) => T, errorMessage?: string): Promise<T[]> {
        const data = await getData();
        if (errorMessage !== undefined && data.length === 0) throw errorMessage;
        return data.map(mapper);
      },
      async one(errorMessage?: string): Promise<E> {
        const data = await getData();
        if (errorMessage !== undefined && data.length !== 1) throw errorMessage;
        return data[0];
      },
      async pick<T>(mapper: (item: E) => T, errorMessage?: string): Promise<T> {
        const data = await getData();
        if (errorMessage !== undefined && data.length !== 1) throw errorMessage;
        return mapper(data[0]);
      }
    };
  }
  function getJsonResult<E>(rows: { value: any; metadata: { colName: string } }[][]): E[] {
    return rows.map(row => {
      const record: any = {};
      row.forEach(field => (record[field.metadata.colName] = field.value));
      return record;
    });
  }
}

export type Db = typeof createDb extends (connection: Connection) => infer T ? T : any;

export function withDb(task: (db: Db) => Promise<any>): Promise<any> {
  return new Promise((resolve, reject) => {
    const connection = createConnection();
    connection.on('connect', async error => {
      if (error) return reject(error);
      try {
        const result = await task(createDb(connection));
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}
export function withTransactionalDb(task: (db: Db) => Promise<any>, isolationLevel: IsolationLevel = IsolationLevel.RepeatableRead): Promise<any> {
  return new Promise((resolve, reject) => {
    const connection = createConnection();
    connection.on('connect', async error => {
      if (error) return reject(error);
      connection.transaction(
        async (error, done) => {
          if (error) return reject(error);
          try {
            const result = await task(createDb(connection));
            done(null, err => (err ? reject(err) : resolve(result)));
          } catch (error) {
            done(error, err => reject(err || error));
          }
        },
        undefined,
        (isolationLevel as any) as ISOLATION_LEVEL
      );
    });
  });
}

export enum IsolationLevel {
  NoChange = ISOLATION_LEVEL.NO_CHANGE,

  /**
   * A query in the current transaction can read data modified within another transaction but not yet committed.
   * The database engine does not issue shared locks when Read Uncommitted is specified,
   * making this the least restrictive of the isolation levels. As a result, it’s possible that
   * a statement will read rows that have been inserted, updated or deleted, but never committed to the database,
   * a condition known as dirty reads. It’s also possible for data to be modified by another transaction between
   * issuing statements within the current transaction, resulting in nonrepeatable reads or phantom reads.
   */
  ReadUnCommited = ISOLATION_LEVEL.READ_UNCOMMITTED,

  /**
   * A query in the current transaction cannot read data modified by another transaction that has not yet committed,
   * thus preventing dirty reads. However, data can still be modified by other transactions between issuing
   * statements within the current transaction, so nonrepeatable reads and phantom reads are still possible.
   * The isolation level uses shared locking or row versioning to prevent dirty reads, depending on whether the
   * READ_COMMITTED_SNAPSHOT database option is enabled. Read Committed is the default isolation level for all SQL Server databases.
   *
   * Sample:
   *
   *     SET TRANSACTION ISOLATION LEVEL READ COMMITTED
   *         BEGIN TRAN
   *         SELECT * FROM TestTable
   *         INSERT INTO testtemp(id) VALUES(1)
   *         WAITFOR DELAY '00:00:05'
   *         COMMIT
   *
   *       SELECT * FROM TestTable
   */
  ReadCommited = ISOLATION_LEVEL.READ_COMMITTED,

  /**
   * A query in the current transaction cannot read data modified by another transaction that has not yet committed,
   * thus preventing dirty reads. In addition, no other transactions can modify data being read by the current transaction
   * until it completes, eliminating nonrepeatable reads. However, if another transaction inserts new rows that match the search condition
   * in the current transaction, in between the current transaction accessing the same data twice, phantom rows can appear in the second read.
   * Sample:
   *
   *     SET TRANSACTION ISOLATION LEVEL REPEATABLE READ
            BEGIN TRAN
            SELECT * FROM TestTable
            INSERT INTO testtemp(id) VALUES(1)
            WAITFOR DELAY '00:00:05'
            COMMIT

          SELECT * FROM TestTable
   *
   */
  RepeatableRead = ISOLATION_LEVEL.REPEATABLE_READ,

  /**
   *A query in the current transaction cannot read data modified by another transaction that has not yet committed. No other
   * transaction can modify data being read by the current transaction until it completes, and no other transaction can insert
   * new rows that would match the search condition in the current transaction until it completes. As a result, the Serializable
   * isolation level prevents dirty reads, nonrepeatable reads, and phantom reads. However, it can have the biggest impact on
   * performance, compared to the other isolation levels.
   */
  Serializable = ISOLATION_LEVEL.SERIALIZABLE,

  /**
   * A statement can use data only if it will be in a consistent state throughout the transaction.
   * If another transaction modifies data after the start of the current transaction, the data is not
   * visible to the current transaction. The current transaction works with a snapshot of the data as it
   * existed at the beginning of that transaction. Snapshot transactions do not request locks when reading data,
   *  nor do they block other transactions from writing data. In addition, other transactions writing data do not
   * block the current transaction for reading data. As with the Serializable isolation level, the Snapshot level prevents dirty reads,
   * nonrepeatable reads and phantom reads. However, it is susceptible to concurrent update errors. (not ANSI/ISO SQL standard)
   */
  Snapshot = ISOLATION_LEVEL.SNAPSHOT
}

//////////////////////////////////////////////////////////////////////////////////////////

// connection.on('connect', error => {
//   if (error) {
//     console.error(error);
//     return;
//   }
//   console.log('Connected!');

//   const request = new TediousRequest('SELECT @x', (error, rowCount, rows) => {
//     if (error) {
//       console.error(error);
//       return;
//     }
//     console.log('Requested!', rowCount, rows);

//     connection.close();
//   });
//   request.addParameter('x', TYPES.NVarChar, 'some value for x');

//   connection.execSql(request);
// });

// connection.on('end', () => {
//   console.log('Disconnected.');
// });

// connection.on('errorMessage', error => {
//   console.error('Server error:', error);
// });

//////////////////////////////////////////////////////////////////////////////////////////

// connection.on('connect', error => {
//   if (error) {
//     console.error(error);
//     return;
//   }
//   console.log('Connected!');

//   connection.transaction((error, done) => {
//     if (error) {
//       console.error(error);
//       return;
//     }
//     console.log('In transaction.');

//     const request = new TediousRequest('SELECT @x', (error, rowCount, rows) => {
//       if (error) {
//         console.error(error);
//         done(error, error => {
//           if (error) {
//             console.error(error); // Could not even rollback the transaction.
//             return;
//           }
//           console.log('Rollbacked correctly.');
//         });
//         return;
//       }
//       console.log('Requested!', rowCount, rows);

//       done(null, error => {
//         if (error) {
//           console.error(error); // Could not commit the transaction.
//         } else {
//           console.log('Committed correctly.');
//         }

//         connection.close();
//       });
//     });
//     request.addParameter('x', TYPES.NVarChar, 'some value for x');

//     connection.execSql(request);
//   });

// });
