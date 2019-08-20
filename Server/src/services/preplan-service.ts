import { Router } from 'express';
import PreplanEntity, { convertPreplanEntityToModel } from 'src/entities/PreplanEntity';
import { PreplanHeaderEntity, convertPreplanHeaderEntityToModel } from 'src/entities/PreplanHeadersEntity';
import { DbAccess } from 'src/utils/sqlServer';
import FlightRequirementEntity from 'src/entities/flight/_FlightRequirementEntity';
import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import { requestMiddlewareWithDbAccess } from 'src/utils/requestMiddleware';
import NewPreplanModel, { NewPreplanModelValidation } from '@core/models/NewPreplanModel';
import EditPreplanModel from '@core/models/EditPreplanModel';

const router = Router();
export default router;

router.post(
  '/get-all-headers',
  requestMiddlewareWithDbAccess<{}, PreplanHeaderModel[]>(async (userId, {}, { runSp }) => {
    const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/create-empty',
  requestMiddlewareWithDbAccess<NewPreplanModel, string>(async (userId, newPreplan, { runSp, runQuery }) => {
    const userPreplanNames: string[] = await runQuery(`select [Name] from [RPA].[Preplan] where [Id_User] = '${userId}'`);
    new NewPreplanModelValidation(newPreplan, userPreplanNames).throw('Invalid API input.');

    const result: string[] = await runSp(
      '[RPA].[SP_CreatePreplanEmpty]',
      runSp.varCharParam('userId', userId),
      runSp.nVarCharParam('name', newPreplan.name, 200),
      runSp.dateTimeParam('startDate', newPreplan.startDate),
      runSp.dateTimeParam('endDate', newPreplan.endDate)
    );
    const newPreplanId = result[0];

    return newPreplanId;
  })
);

router.post(
  '/edit-header',
  requestMiddlewareWithDbAccess<EditPreplanModel, PreplanHeaderModel[]>(async (userId, editPreplan, { runSp, runQuery }) => {
    const userPreplanNames: string[] = await runQuery(`select [Name] from [RPA].[Preplan] where [Id_User] = '${userId}' and [Id] <> '${editPreplan.id}'`);
    new NewPreplanModelValidation(editPreplan, userPreplanNames).throw('Invalid API input.');

    const preplanHeaderEntity: PreplanHeaderEntity[] = await runSp(
      '[RPA].[Sp_EditPreplanHeader]',
      runSp.varCharParam('userId', userId),
      runSp.varCharParam('id', editPreplan.id),
      runSp.nVarCharParam('name', editPreplan.name, 200),
      runSp.dateTimeParam('startDate', editPreplan.startDate),
      runSp.dateTimeParam('endDate', editPreplan.endDate)
    );

    const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/remove',
  requestMiddlewareWithDbAccess<{ id: string }, PreplanHeaderModel[]>(async (userId, { id }, { runSp }) => {
    await runSp('[RPA].[Sp_RemovePrePlan]', runSp.varCharParam('userId', userId), runSp.varCharParam('id', id));

    const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/set-published',
  requestMiddlewareWithDbAccess<{ id: string; published: boolean }, PreplanHeaderModel[]>(async (userId, { id, published }, { runSp }) => {
    await runSp('[RPA].[Sp_SetPublished]', runSp.varCharParam('userId', userId), runSp.varCharParam('id', id), runSp.bitParam('published', published));

    const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/clone',
  requestMiddlewareWithDbAccess<{ id: string; newPreplanModel: NewPreplanModel }, string>(async (userId, { id, newPreplanModel }, { runSp, runQuery }) => {
    const userPreplanNames: string[] = await runQuery(`select [Name] from [RPA].[Preplan] where [Id_User] = '${userId}'`);
    new NewPreplanModelValidation(newPreplanModel, userPreplanNames).throw('Invalid API input.');

    const result: string[] = await runSp(
      '[RPA].[SP_ClonePreplan]',
      runSp.varCharParam('userId', userId),
      runSp.varCharParam('id', id),
      runSp.nVarCharParam('name', newPreplanModel.name, 200),
      runSp.dateTimeParam('startDate', newPreplanModel.startDate),
      runSp.dateTimeParam('endDate', newPreplanModel.endDate)
    );
    const newPreplanId = result[0];

    return newPreplanId;
  })
);

// router.post('/clone', asyncMiddlewareWithTransactionalDbAccess(clonedPreplan));
// router.post('/get', asyncMiddlewareWithDbAccess(getHandler));
// router.post('/edit-header', asyncMiddlewareWithDbAccess(editHeaderHandler));
// router.post('/finalize', asyncMiddlewareWithDbAccess(finalizeHandler));
// router.post('/remove', asyncMiddlewareWithTransactionalDbAccess(removeHandler));

// router.post('/update-auto-arranger-options', asyncMiddlewareWithDatabase(updateAutoArrangerOptionsHandler));
// // router.post('/add-or-edit-dummy-aircraft-register', asyncMiddlewareWithDatabase(addOrEditDummyAircraftRegisterHandler));
// // router.post('/remove-dummy-aircraft-register', asyncMiddlewareWithDatabase(removeDummyAircraftRegisterHandler));
// // router.post('/update-aircraft-register-options-dictionary', asyncMiddlewareWithDatabase(updateAircraftRegisterOptionsdictionaryHandler));
// router.post('/add-or-edit-flight-requirement', asyncMiddlewareWithDatabase(addOrEditFlightRequirementHandler));
// router.post('/remove-flight-requirement', asyncMiddlewareWithDatabase(removeFlightRequirementHandler));

async function clonedPreplan(userId, body, { runSp }: DbAccess) {
  // PreplanValidator.createEmptyValidate(req.body.name,req.body.startDate, req.body.endDate).throwIfErrorsExsit();
  //remove proc SP_ClonedPreplan and use InsertPreplan + inserrt flight requerment
  const result: readonly PreplanHeaderEntity[] = await runSp(
    '[RPA].[SP_ClonedPreplan]',
    runSp.bigIntParam('userId', userId),
    runSp.intParam('id', body.Id),
    runSp.nVarCharParam('name', body.parentPreplanId, 200),
    runSp.dateTimeParam('startDate', body.startDate),
    runSp.dateTimeParam('endDate', body.endDate)
  );
  return result;
  // PreplanValidator.cloneValidate(name, startDate, endDate).throwIfErrorsExsit();
  //   const sourcePreplan: PreplanEntity | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) }, { session });
  //   if (!sourcePreplan) throw 'Preplan is not found.';
  //   const sourceFlightRequrements: FlightRequirementEntity[] = await db
  //     .collection('flightRequirements')
  //     .find({ preplanId: ObjectID.createFromHexString(id) }, { session })
  //     .toArray();
  //   const clonedPreplan: PreplanEntity = {
  //     name,
  //     published: false,
  //     finalized: false,
  //     userId: currentUser.id,
  //     userName: currentUser.name,
  //     userDisplayName: currentUser.displayName,
  //     parentPreplanId: sourcePreplan._id,
  //     parentPreplanName: sourcePreplan.name,
  //     creationDateTime: new Date(),
  //     lastEditDateTime: new Date(),
  //     startDate: new Date(startDate),
  //     endDate: new Date(endDate),
  //     simulationId: undefined,
  //     simulationName: undefined,
  //     autoArrangerOptions: sourcePreplan.autoArrangerOptions,
  //     autoArrangerState: {
  //       solving: false,
  //       solvingStartDateTime: undefined,
  //       solvingDuration: undefined,
  //       message: undefined,
  //       messageViewed: true,
  //       changeLogs: [],
  //       changeLogsViewed: true
  //     },
  //     dummyAircraftRegisters: sourcePreplan.dummyAircraftRegisters,
  //     aircraftRegisterOptionsDictionary: sourcePreplan.aircraftRegisterOptionsDictionary
  //   };
  //   const insertPreplanResult = await db.collection('preplans').insertOne(clonedPreplan, { session });
  //   if (!insertPreplanResult.result.ok) throw 'Unable to copy preplan.';
  //   const clonedPreplanObjectId = insertPreplanResult.insertedId;
  //   const clonedPreplanId = clonedPreplanObjectId.toHexString();
  //   const clonedFlightRequirements: FlightRequirementEntity[] = sourceFlightRequrements.map(f => ({
  //     preplanId: clonedPreplanObjectId,
  //     definition: f.definition,
  //     scope: f.scope,
  //     days: f.days,
  //     ignored: f.ignored
  //   }));
  //   const insertFlightRequirementsResult = await db.collection('flightRequirements').insertMany(clonedFlightRequirements, { session });
  //   if (!insertFlightRequirementsResult.result.ok) throw 'Unable to copy preplan.';
  //return clonedPreplanId;
}

async function getHandler(userId, body, { runSp }: DbAccess) {
  // PreplanValidator.createEmptyValidate(req.body.name,req.body.startDate, req.body.endDate).throwIfErrorsExsit();
  const Preplans: readonly PreplanEntity[] | null = await runSp('[RPA].[SP_GetPreplanDetails]', runSp.bigIntParam('userId', userId), runSp.intParam('Id', body.Id));
  const preplan: PreplanEntity | null = Preplans[0];
  const flightRequirements: readonly FlightRequirementEntity[] = await runSp(
    '[RPA].[Sp_GetFlightRequirement]',
    runSp.bigIntParam('userId', userId),
    runSp.intParam('preplanId', preplan.id)
  );
  const result: PreplanModel = convertPreplanEntityToModel(preplan, flightRequirements);
  return result;

  //   const preplan: PreplanEntity | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) });
  //   if (!preplan) throw 'Preplan is not found.';

  //   const flightRequirements: FlightRequirementEntity[] = await db
  //     .collection('flightRequirements')
  //     .find({ preplanId: ObjectID.createFromHexString(id) })
  //     .toArray();

  //   const result: PreplanModel = convertPreplanEntityToModel(preplan, flightRequirements);

  //   return result;
}

async function editHeaderHandler(userId, body, { runSp }: DbAccess) {
  // PreplanValidator.editHeaderValidate(name, startDate, endDate).throwIfErrorsExsit();
  const result: readonly PreplanHeaderEntity[] = await runSp(
    '[RPA].[Sp_UpdatePreplanHeader]',
    runSp.bigIntParam('userId', userId),
    runSp.intParam('Id', body.Id),
    runSp.nVarCharParam('name', body.parentPreplanId, 200),
    runSp.dateTimeParam('startDate', body.startDate),
    runSp.dateTimeParam('startDate', body.startDate),
    runSp.bitParam('published', body.published)
  );
  return result;

  //   const result = await db
  //     .collection('preplans')
  //     .findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { $set: { name, published, startDate, endDate, lastEditDateTime: new Date() } });
  //   if (!result.ok) throw 'Preplan is not updated.';

  //   return await getAllHeadersHandler(db, {});
}

async function finalizeHandler(userId, body, { runSp }: DbAccess) {
  const result: readonly PreplanHeaderEntity[] = await runSp(
    '[RPA].[Sp_SetPreplanFinalized]',
    runSp.bigIntParam('userId', userId),
    runSp.intParam('Id', body.Id),
    runSp.bitParam('finalized', body.finalized)
  );

  //   const result = await db.collection('preplans').findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { $set: { finalized: true, lastEditDateTime: new Date() } });
  //   if (!result.ok) throw 'Preplan is not updated.';

  //   return await getHandler(db, { id });
}

async function removeHandler(userId, body, { runSp }: DbAccess) {
  const result = await runSp('[RPA].[SP_GetPreplanDetails]', runSp.bigIntParam('userId', userId), runSp.intParam('Id', body.Id));
  return result;

  //   const preplan: PreplanEntity | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) }, { session });
  //   if (!preplan) throw 'Preplan is not found.';

  //   const updateChildrenResult = await db
  //     .collection('preplans')
  //     .updateMany(
  //       { parentPreplanId: ObjectID.createFromHexString(id) },
  //       { $set: { parentPreplanId: preplan.parentPreplanId, parentPreplanName: preplan.parentPreplanName } },
  //       { session }
  //     );
  //   if (!updateChildrenResult.result.ok) throw 'Preplan is not deleted.';

  //   const deletePreplanResult = await db.collection('preplans').deleteOne({ _id: ObjectID.createFromHexString(id) }, { session });
  //   if (!deletePreplanResult.result.ok) throw 'Preplan is not deleted.';

  //   const deleteFlightRequirementsResult = await db.collection('flightRequirements').deleteMany({ preplanId: ObjectID.createFromHexString(id) }, { session });
  //   if (!deleteFlightRequirementsResult.result.ok) throw 'Preplan is not deleted.';

  //   return await getHandler(db, { id });
}

// async function updateAutoArrangerOptionsHandler(db: Db, { id, autoArrangerOptions }) {
//   // PreplanValidator.updateAutoArrangerOptionsValidate(autoArrangerOptions).throwIfErrorsExsit();

//   const data: AutoArrangerOptionsEntity = {
//     minimumGroundTimeMode: autoArrangerOptions.minimumGroundTimeMode,
//     minimumGroundTimeOffset: autoArrangerOptions.minimumGroundTimeOffset
//   };
//   const result = await db.collection('preplans').findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { $set: { autoArrangerOptions: data } });
//   if (!result.ok) throw 'Auto-arranger options are not updated.';

//   return data;
// }

// /*
// async function addOrEditDummyAircraftRegisterHandler(db: Db, { id, dummyAircraftRegister }) {
//   PreplanValidator.addOrEditDummyAircraftRegisterValidate(dummyAircraftRegister).throwIfErrorsExsit();

//   const preplan: PreplanSchema | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) });
//   if (!preplan) throw 'Preplan is not found.';

//   const data: DummyAircraftRegisterModel = {
//     id: dummyAircraftRegister.id,
//     name: dummyAircraftRegister.name,
//     aircraftTypeId: dummyAircraftRegister.aircraftTypeId
//   };

//   if (preplan.dummyAircraftRegisters.some(a => a.name.toUpperCase() === data.name && a.id !== data.id)) throw 'Name already exists among other dummy aircraft registers.';

//   const modifiedDummyAircraftRegisters: DummyAircraftRegisterModel[] = preplan.dummyAircraftRegisters.slice();
//   const index = modifiedDummyAircraftRegisters.findIndex(a => a.id === data.id);
//   if (index < 0) {
//     // let count = 1;
//     // while (modifiedDummyAircraftRegisters.some(a => a.id === 'dummy-' + count)) count++;
//     // data.id = 'dummy-' + count;
//     modifiedDummyAircraftRegisters.push(data);
//   } else {
//     modifiedDummyAircraftRegisters.splice(index, 1, data);
//   }

//   const result = await db.collection('preplans').updateOne({ _id: ObjectID.createFromHexString(id) }, { $set: { dummyAircraftRegisters: modifiedDummyAircraftRegisters } });
//   if (!result.result.ok) throw `Aircraft register '${data.name.toUpperCase()}' is not ${data.id ? 'edited' : 'added'}.`;

//   return await getHandler(db, { id });
// }

// async function removeDummyAircraftRegisterHandler(db: Db, { dummyAircraftRegisterId }) {
//   // do it...

//   return {} as PreplanModel;
// }

// async function updateAircraftRegisterOptionsdictionaryHandler(db: Db, { id, aircraftRegisterOptionsDictionary }) {
//   // const aircraftRegisterOptionsDictionary: Readonly<AircraftRegisterOptionsDictionary> = data.aircraftRegisterOptionsDictionary;

//   // do it...

//   return { id } as PreplanModel;
// }
// */

// async function addOrEditFlightRequirementHandler(db: Db, { id, flightRequirement }) {
//   const preplan: PreplanEntity | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) });
//   if (!preplan) throw 'Preplan is not found.';

//   const dummyAircraftRegisters = preplan.dummyAircraftRegisters.map(convertDummyAircraftRegisterEntityToModel);
//   // PreplanValidator.addOrEditFlightRequirementValidate(flightRequirement, dummyAircraftRegisters).throwIfErrorsExsit();

//   // const data:FlightRequirementEntity={
//   //   _id:flightRequirement.id&&ObjectID.createFromHexString(flightRequirement.id),
//   //   preplanId:ObjectID.createFromHexString(id)
//   //   ,definition:flightRequirement.definition
//   // }

//   return flightRequirement;
// }

// async function removeFlightRequirementHandler(db: Db, { flightRequirementId }) {
//   throw 'Not implemented.';

//   return true;
// }
