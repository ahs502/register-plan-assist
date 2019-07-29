import { Router } from 'express';
import PreplanEntity, { convertPreplanEntityToModel } from 'src/entities/PreplanEntity';
import { withAccessMiddleware, withTransactionalAccessMiddleware } from 'src/utils/asyncMiddleware';
import { PreplanHeaderEntity, convertPreplanHeaderEntityToModel } from 'src/entities/PreplanHeadersEntity';
import { Access } from 'src/utils/sqlServer';
import FlightRequirementEntity from 'src/entities/flight/_FlightRequirementEntity';
import PreplanModel from '@core/models/PreplanModel';

const router = Router();
export default router;

//TODO: Replace these with a better implementation:
// const currentUser = { id: '1001', name: 'MAHANAIR\\123456', displayName: 'Hessamoddin Khan' };

router.post('/get-all-headers', withAccessMiddleware(getAllHeadersHandler));
router.post('/create-empty', withAccessMiddleware(createEmptyHandler));
router.post('/clone', withTransactionalAccessMiddleware(clonedPreplan));
router.post('/get', withAccessMiddleware(getHandler));
router.post('/edit-header', withAccessMiddleware(editHeaderHandler));
router.post('/finalize', withAccessMiddleware(finalizeHandler));
router.post('/remove', withTransactionalAccessMiddleware(removeHandler));
// router.post('/update-auto-arranger-options', asyncMiddlewareWithDatabase(updateAutoArrangerOptionsHandler));
// // router.post('/add-or-edit-dummy-aircraft-register', asyncMiddlewareWithDatabase(addOrEditDummyAircraftRegisterHandler));
// // router.post('/remove-dummy-aircraft-register', asyncMiddlewareWithDatabase(removeDummyAircraftRegisterHandler));
// // router.post('/update-aircraft-register-options-dictionary', asyncMiddlewareWithDatabase(updateAircraftRegisterOptionsdictionaryHandler));
// router.post('/add-or-edit-flight-requirement', asyncMiddlewareWithDatabase(addOrEditFlightRequirementHandler));
// router.post('/remove-flight-requirement', asyncMiddlewareWithDatabase(removeFlightRequirementHandler));

async function getAllHeadersHandler({ runSp }: Access) {
  const userId = 4223;
  const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.intParam('userId', userId));
  const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
  return preplanHeaderModels;
}

async function createEmptyHandler({ req, runSp }: Access) {
  // PreplanValidator.createEmptyValidate(req.body.name,req.body.startDate, req.body.endDate).throwIfErrorsExsit();
  // change all InsertPreplan ....
  const userId = '4223';
  const result: readonly PreplanHeaderEntity[] = await runSp(
    '[RPA].[SP_InsertPreplanHeader]',
    runSp.varCharParam('userId', userId),
    runSp.nVarCharParam('name', req.body.name, 200),
    runSp.intParam('parentPreplanId', req.body.parentPreplanId),
    runSp.dateTimeParam('startDate', req.body.startDate),
    runSp.dateTimeParam('endDate', req.body.endDate)
  );
  return result;
}

async function clonedPreplan({ req, runSp }: Access) {
  // PreplanValidator.createEmptyValidate(req.body.name,req.body.startDate, req.body.endDate).throwIfErrorsExsit();
  //remove proc SP_ClonedPreplan and use InsertPreplan + inserrt flight requerment
  const userId = '4223';
  const result: readonly PreplanHeaderEntity[] = await runSp(
    '[RPA].[SP_ClonedPreplan]',
    runSp.bigIntParam('userId', userId),
    runSp.intParam('Id', req.body.Id),
    runSp.nVarCharParam('name', req.body.parentPreplanId, 200),
    runSp.dateTimeParam('startDate', req.body.startDate),
    runSp.dateTimeParam('endDate', req.body.endDate)
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

async function getHandler({ req, types, runSp }: Access) {
  // PreplanValidator.createEmptyValidate(req.body.name,req.body.startDate, req.body.endDate).throwIfErrorsExsit();
  const userId = '4223';
  const Preplans: readonly PreplanEntity[] | null = await runSp('[RPA].[SP_GetPreplanDetails]', runSp.bigIntParam('userId', userId), runSp.intParam('Id', req.body.Id));
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

async function editHeaderHandler({ req, types, runSp }: Access) {
  // PreplanValidator.editHeaderValidate(name, startDate, endDate).throwIfErrorsExsit();
  const userId = '4223';
  const result: readonly PreplanHeaderEntity[] = await runSp(
    '[RPA].[Sp_UpdatePreplanHeader]',
    runSp.bigIntParam('userId', userId),
    runSp.intParam('Id', req.body.Id),
    runSp.nVarCharParam('name', req.body.parentPreplanId, 200),
    runSp.dateTimeParam('startDate', req.body.startDate),
    runSp.dateTimeParam('startDate', req.body.startDate),
    runSp.bitParam('published', req.body.published)
  );
  return result;

  //   const result = await db
  //     .collection('preplans')
  //     .findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { $set: { name, published, startDate, endDate, lastEditDateTime: new Date() } });
  //   if (!result.ok) throw 'Preplan is not updated.';

  //   return await getAllHeadersHandler(db, {});
}

async function finalizeHandler({ req, types, runSp }: Access) {
  const userId = '4223';
  const result: readonly PreplanHeaderEntity[] = await runSp(
    '[RPA].[Sp_SetPreplanFinalized]',
    runSp.bigIntParam('userId', userId),
    runSp.intParam('Id', req.body.Id),
    runSp.bitParam('finalized', req.body.finalized)
  );

  //   const result = await db.collection('preplans').findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { $set: { finalized: true, lastEditDateTime: new Date() } });
  //   if (!result.ok) throw 'Preplan is not updated.';

  //   return await getHandler(db, { id });
}

async function removeHandler({ req, types, runSp }: Access) {
  const userId = '4223';
  const result = await runSp('[RPA].[SP_GetPreplanDetails]', runSp.bigIntParam('userId', userId), runSp.intParam('Id', req.body.Id));
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
