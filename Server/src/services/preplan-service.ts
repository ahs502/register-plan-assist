import { Router } from 'express';
import { Db, ObjectID, ClientSession } from 'mongodb';
import { asyncMiddlewareWithDatabase, asyncMiddlewareWithTransaction } from '../utils/asyncMiddleware';

import PreplanValidator from '@core/validators/PreplanValidator';

import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';

import PreplanEntity, { PreplanHeaderEntity, preplanHeaderProjection, convertPreplanHeaderEntityToModel, convertPreplanEntityToModel } from 'src/entities/PreplanEntity';
import FlightRequirementEntity from 'src/entities/FlightRequirementEntity';
import AutoArrangerOptionsEntity from 'src/entities/AutoArrangerOptionsEntity';
import { convertDummyAircraftRegisterEntityToModel } from 'src/entities/DummyAircraftRegisterEntity';

const router = Router();
export default router;

//TODO: Replace these with a better implementation:
const currentUser = { id: '1001', name: 'MAHANAIR\\123456', displayName: 'Hessamoddin Khan' };

router.post('/get-all-headers', asyncMiddlewareWithDatabase(getAllHeadersHandler));
router.post('/create-empty', asyncMiddlewareWithDatabase(createEmptyHandler));
router.post('/clone', asyncMiddlewareWithTransaction(cloneHandler));
router.post('/get', asyncMiddlewareWithDatabase(getHandler));
router.post('/edit-header', asyncMiddlewareWithDatabase(editHeaderHandler));
router.post('/finalize', asyncMiddlewareWithDatabase(finalizeHandler));
router.post('/remove', asyncMiddlewareWithTransaction(removeHandler));
router.post('/update-auto-arranger-options', asyncMiddlewareWithDatabase(updateAutoArrangerOptionsHandler));
// router.post('/add-or-edit-dummy-aircraft-register', asyncMiddlewareWithDatabase(addOrEditDummyAircraftRegisterHandler));
// router.post('/remove-dummy-aircraft-register', asyncMiddlewareWithDatabase(removeDummyAircraftRegisterHandler));
// router.post('/update-aircraft-register-options-dictionary', asyncMiddlewareWithDatabase(updateAircraftRegisterOptionsdictionaryHandler));
router.post('/add-or-edit-flight-requirement', asyncMiddlewareWithDatabase(addOrEditFlightRequirementHandler));
router.post('/remove-flight-requirement', asyncMiddlewareWithDatabase(removeFlightRequirementHandler));

async function getAllHeadersHandler(db: Db, {}) {
  const raw: PreplanHeaderEntity[] = await db
    .collection('preplans')
    .find({ $or: [{ userId: currentUser.id }, { published: true }] })
    .project(preplanHeaderProjection)
    .toArray();

  const result: PreplanHeaderModel[] = raw.map(convertPreplanHeaderEntityToModel);

  return result;
}

async function createEmptyHandler(db: Db, { name, startDate, endDate }) {
  PreplanValidator.createEmptyValidate(name, startDate, endDate).throwIfErrorsExsit();

  const preplan: PreplanEntity = {
    name,
    published: false,
    finalized: false,
    userId: currentUser.id,
    userName: currentUser.name,
    userDisplayName: currentUser.displayName,
    parentPreplanId: undefined,
    parentPreplanName: undefined,
    creationDateTime: new Date(),
    lastEditDateTime: new Date(),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    simulationId: undefined,
    simulationName: undefined,
    autoArrangerOptions: undefined,
    dummyAircraftRegisters: [],
    aircraftRegisterOptionsDictionary: {}
  };
  const result = await db.collection('preplans').insertOne(preplan);
  if (!result.result.ok) throw 'Unable to create a new preplan.';
  const preplanId = result.insertedId.toHexString();

  return preplanId;
}

async function cloneHandler(db: Db, session: ClientSession, { id, name, startDate, endDate }) {
  PreplanValidator.cloneValidate(name, startDate, endDate).throwIfErrorsExsit();

  const sourcePreplan: PreplanEntity | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) }, { session });
  if (!sourcePreplan) throw 'Preplan is not found.';

  const sourceFlightRequrements: FlightRequirementEntity[] = await db
    .collection('flightRequirements')
    .find({ preplanId: ObjectID.createFromHexString(id) }, { session })
    .toArray();

  const clonedPreplan: PreplanEntity = {
    name,
    published: false,
    finalized: false,
    userId: currentUser.id,
    userName: currentUser.name,
    userDisplayName: currentUser.displayName,
    parentPreplanId: sourcePreplan._id,
    parentPreplanName: sourcePreplan.name,
    creationDateTime: new Date(),
    lastEditDateTime: new Date(),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    simulationId: undefined,
    simulationName: undefined,
    autoArrangerOptions: sourcePreplan.autoArrangerOptions,
    dummyAircraftRegisters: sourcePreplan.dummyAircraftRegisters,
    aircraftRegisterOptionsDictionary: sourcePreplan.aircraftRegisterOptionsDictionary
  };
  const insertPreplanResult = await db.collection('preplans').insertOne(clonedPreplan, { session });
  if (!insertPreplanResult.result.ok) throw 'Unable to copy preplan.';
  const clonedPreplanObjectId = insertPreplanResult.insertedId;
  const clonedPreplanId = clonedPreplanObjectId.toHexString();

  const clonedFlightRequirements: FlightRequirementEntity[] = sourceFlightRequrements.map(f => ({
    preplanId: clonedPreplanObjectId,
    definition: f.definition,
    scope: f.scope,
    days: f.days,
    ignored: f.ignored
  }));
  const insertFlightRequirementsResult = await db.collection('flightRequirements').insertMany(clonedFlightRequirements, { session });
  if (!insertFlightRequirementsResult.result.ok) throw 'Unable to copy preplan.';

  return clonedPreplanId;
}

async function getHandler(db: Db, { id }) {
  const preplan: PreplanEntity | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) });
  if (!preplan) throw 'Preplan is not found.';

  const flightRequirements: FlightRequirementEntity[] = await db
    .collection('flightRequirements')
    .find({ preplanId: ObjectID.createFromHexString(id) })
    .toArray();

  const result: PreplanModel = convertPreplanEntityToModel(preplan, flightRequirements);

  return result;
}

async function editHeaderHandler(db: Db, { id, name, published, startDate, endDate }) {
  PreplanValidator.editHeaderValidate(name, startDate, endDate).throwIfErrorsExsit();

  const result = await db
    .collection('preplans')
    .findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { $set: { name, published, startDate, endDate, lastEditDateTime: new Date() } });
  if (!result.ok) throw 'Preplan is not updated.';

  return await getAllHeadersHandler(db, {});
}

async function finalizeHandler(db: Db, { id }) {
  const result = await db.collection('preplans').findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { $set: { finalized: true, lastEditDateTime: new Date() } });
  if (!result.ok) throw 'Preplan is not updated.';

  return await getHandler(db, { id });
}

async function removeHandler(db: Db, session: ClientSession, { id }) {
  const preplan: PreplanEntity | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) }, { session });
  if (!preplan) throw 'Preplan is not found.';

  const updateChildrenResult = await db
    .collection('preplans')
    .updateMany(
      { parentPreplanId: ObjectID.createFromHexString(id) },
      { $set: { parentPreplanId: preplan.parentPreplanId, parentPreplanName: preplan.parentPreplanName } },
      { session }
    );
  if (!updateChildrenResult.result.ok) throw 'Preplan is not deleted.';

  const deletePreplanResult = await db.collection('preplans').deleteOne({ _id: ObjectID.createFromHexString(id) }, { session });
  if (!deletePreplanResult.result.ok) throw 'Preplan is not deleted.';

  const deleteFlightRequirementsResult = await db.collection('flightRequirements').deleteMany({ preplanId: ObjectID.createFromHexString(id) }, { session });
  if (!deleteFlightRequirementsResult.result.ok) throw 'Preplan is not deleted.';

  return await getHandler(db, { id });
}

async function updateAutoArrangerOptionsHandler(db: Db, { id, autoArrangerOptions }) {
  PreplanValidator.updateAutoArrangerOptionsValidate(autoArrangerOptions).throwIfErrorsExsit();

  const data: AutoArrangerOptionsEntity = {
    minimumGroundTimeMode: autoArrangerOptions.minimumGroundTimeMode,
    minimumGroundTimeOffset: autoArrangerOptions.minimumGroundTimeOffset
  };
  const result = await db.collection('preplans').findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { $set: { autoArrangerOptions: data } });
  if (!result.ok) throw 'Auto-arranger options are not updated.';

  return data;
}

/*
async function addOrEditDummyAircraftRegisterHandler(db: Db, { id, dummyAircraftRegister }) {
  PreplanValidator.addOrEditDummyAircraftRegisterValidate(dummyAircraftRegister).throwIfErrorsExsit();

  const preplan: PreplanSchema | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) });
  if (!preplan) throw 'Preplan is not found.';

  const data: DummyAircraftRegisterModel = {
    id: dummyAircraftRegister.id,
    name: dummyAircraftRegister.name,
    aircraftTypeId: dummyAircraftRegister.aircraftTypeId
  };

  if (preplan.dummyAircraftRegisters.some(a => a.name.toUpperCase() === data.name && a.id !== data.id)) throw 'Name already exists among other dummy aircraft registers.';

  const modifiedDummyAircraftRegisters: DummyAircraftRegisterModel[] = preplan.dummyAircraftRegisters.slice();
  const index = modifiedDummyAircraftRegisters.findIndex(a => a.id === data.id);
  if (index < 0) {
    // let count = 1;
    // while (modifiedDummyAircraftRegisters.some(a => a.id === 'dummy-' + count)) count++;
    // data.id = 'dummy-' + count;
    modifiedDummyAircraftRegisters.push(data);
  } else {
    modifiedDummyAircraftRegisters.splice(index, 1, data);
  }

  const result = await db.collection('preplans').updateOne({ _id: ObjectID.createFromHexString(id) }, { $set: { dummyAircraftRegisters: modifiedDummyAircraftRegisters } });
  if (!result.result.ok) throw `Aircraft register '${data.name.toUpperCase()}' is not ${data.id ? 'edited' : 'added'}.`;

  return await getHandler(db, { id });
}

async function removeDummyAircraftRegisterHandler(db: Db, { dummyAircraftRegisterId }) {
  // do it...

  return {} as PreplanModel;
}

async function updateAircraftRegisterOptionsdictionaryHandler(db: Db, { id, aircraftRegisterOptionsDictionary }) {
  // const aircraftRegisterOptionsDictionary: Readonly<AircraftRegisterOptionsDictionary> = data.aircraftRegisterOptionsDictionary;

  // do it...

  return { id } as PreplanModel;
}
*/

async function addOrEditFlightRequirementHandler(db: Db, { id, flightRequirement }) {
  const preplan: PreplanEntity | null = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) });
  if (!preplan) throw 'Preplan is not found.';

  const dummyAircraftRegisters = preplan.dummyAircraftRegisters.map(convertDummyAircraftRegisterEntityToModel);
  PreplanValidator.addOrEditFlightRequirementValidate(flightRequirement, dummyAircraftRegisters).throwIfErrorsExsit();

  // const data:FlightRequirementEntity={
  //   _id:flightRequirement.id&&ObjectID.createFromHexString(flightRequirement.id),
  //   preplanId:ObjectID.createFromHexString(id)
  //   ,definition:flightRequirement.definition
  // }

  return flightRequirement;
}

async function removeFlightRequirementHandler(db: Db, { flightRequirementId }) {
  throw 'Not implemented.';

  return true;
}
