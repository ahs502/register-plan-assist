import { Router } from 'express';
// import { Db } from 'mongodb';
// import { asyncMiddlewareWithDatabase } from '../utils/asyncMiddleware';

const router = Router();
export default router;

// async function Handler(data: any, db: Db) {}

// router.post(
//   'get-all',
//   asyncDatabaseMiddleware(async (data, db) => {
//     const collectionSelector: { readonly [collectionName in keyof MasterDataModel]?: true } | undefined = data.collectionSelector;

//     if (!collectionSelector || collectionSelector.aircraftTypes) {
//       // do it...
//     }

//     return {} as Partial<MasterDataModel>;
//   })
// );

// router.post(
//   'add-or-edit-aircraft-group',
//   asyncDatabaseMiddleware(async (data, db) => {
//     const aircraftGroup: Readonly<AircraftGroupModel> = data.aircraftGroup;

//     // do it...

//     return { aircraftGroups: [aircraftGroup] as AircraftGroupModel[] } as Pick<MasterDataModel, 'aircraftGroups'>;
//   })
// );

// router.post(
//   'remove-aircraft-group',
//   asyncDatabaseMiddleware(async (data, db) => {
//     const aircraftGroupId: string = data.aircraftGroupId;

//     // do it...

//     return { aircraftGroups: [] as AircraftGroupModel[] } as Pick<MasterDataModel, 'aircraftGroups'>;
//   })
// );

// router.post(
//   'add-or-edit-constraint',
//   asyncDatabaseMiddleware(async (data, db) => {
//     const constraint: Readonly<ConstraintModel> = data.constraint;

//     // do it...

//     return { constraints: [constraint] as ConstraintModel[] } as Pick<MasterDataModel, 'constraints'>;
//   })
// );

// router.post(
//   'remove-constraint',
//   asyncDatabaseMiddleware(async (data, db) => {
//     const constraintId: string = data.constraintId;

//     // do it...

//     return { constraints: [] as ConstraintModel[] } as Pick<MasterDataModel, 'constraints'>;
//   })
// );
