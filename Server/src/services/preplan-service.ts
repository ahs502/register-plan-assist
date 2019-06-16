import { Router } from 'express';
import { Db, ObjectID, ClientSession } from 'mongodb';
import { asyncMiddlewareWithDatabase, asyncMiddlewareWithTransaction } from '../utils/asyncMiddleware';

import PreplanValidator from '@validators/PreplanValidator';

import { PreplanHeaderModel, PreplanModel } from '@business/Preplan';
import { FlightRequirementModel } from '@business/FlightRequirement';
import { DummyAircraftRegisterModel, AircraftRegisterOptionsDictionary } from '@business/AircraftRegister';
import AutoArrangerOptions from '@business/AutoArrangerOptions';

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
router.post('/remove', asyncMiddlewareWithDatabase(removeHandler));
router.post('/update-auto-arranger-options', asyncMiddlewareWithDatabase(updateAutoArrangerOptionsHandler));
router.post('/add-or-edit-dummy-aircraft-register', asyncMiddlewareWithDatabase(addOrEditDummyAircraftRegisterHandler));
router.post('/remove-dummy-aircraft-register', asyncMiddlewareWithDatabase(removeDummyAircraftRegisterHandler));
router.post('/update-aircraft-register-options-dictionary', asyncMiddlewareWithDatabase(updateAircraftRegisterOptionsdictionaryHandler));
router.post('/add-or-edit-flight-requirement', asyncMiddlewareWithDatabase(addOrEditFlightRequirementHandler));
router.post('/remove-flight-requirement', asyncMiddlewareWithDatabase(removeFlightRequirementHandler));

async function getAllHeadersHandler(db: Db, {}) {
  const raw = await db
    .collection('preplans')
    .find()
    .project({
      name: 1,
      published: 1,
      finalized: 1,
      userId: 1,
      userName: 1,
      userDisplayName: 1,
      parentPreplanId: 1,
      parentPreplanName: 1,
      creationDateTime: 1,
      lastEditDateTime: 1,
      startDate: 1,
      endDate: 1,
      simulationId: 1,
      simulationName: 1
    })
    .toArray();

  raw.forEach(item => {
    item.id = item._id.toHexString();
    delete item._id;
    item.parentPreplanId = item.parentPreplanId.toHexString();
  });
  const result: PreplanHeaderModel[] = raw;

  return result;
}

async function createEmptyHandler(db: Db, { name, startDate, endDate }) {
  PreplanValidator.createEmptyValidate(name, startDate, endDate).throwIfErrorsExsit();

  const preplan: Omit<PreplanModel, 'id' | 'flightRequirements'> = {
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
  const preplanId = result.insertedId.toHexString();

  return preplanId;
}

async function cloneHandler(db: Db, session: ClientSession, { id, name, startDate, endDate }) {
  PreplanValidator.cloneValidate(name, startDate, endDate).throwIfErrorsExsit();

  const sourcePreplan = await db.collection('preplans').findOne({ _id: ObjectID.createFromHexString(id) }, { session });
  if (!sourcePreplan) throw 'Source preplan is not found.';

  const sourceFlightRequrements = await db
    .collection('flightRequirements')
    .find({ preplanId: ObjectID.createFromHexString(id) }, { session })
    .toArray();

  const clonedPreplan: Omit<PreplanModel, 'id' | 'flightRequirements'> = {
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
  const result = await db.collection('preplans').insertOne(clonedPreplan, { session });
  const clonedPreplanObjectId = result.insertedId;

  const clonedFlightRequirements = sourceFlightRequrements.map(f => {
    delete f._id;
    f.preplanId = clonedPreplanObjectId;
    return f;
  });
  await db.collection('flightRequirements').insertMany(clonedFlightRequirements, { session });

  const clonedPreplanId = clonedPreplanObjectId.toHexString();

  return clonedPreplanId;
}

async function getHandler(db: Db, { id }) {
  // do it...

  return { id } as PreplanModel;
}

async function editHeaderHandler(db: Db, { id, name, published, startDate, endDate }) {
  // const id: string = data.id;
  // const name: string = data.id;
  // const published: boolean = data.id;
  // const startDate: Date = new Date(data.id);
  // const endDate: Date = new Date(data.id);

  // do it...

  return [] as PreplanHeaderModel[];
}

async function finalizeHandler(db: Db, { id }) {
  // do it...

  return { id } as PreplanModel;
}

async function removeHandler(db: Db, { id }) {
  // do it...

  return true;
}

async function updateAutoArrangerOptionsHandler(db: Db, { id, autoArrangerOptions }) {
  // const autoArrangerOptions: Readonly<AutoArrangerOptions> = data.autoArrangerOptions;

  // do it...

  return autoArrangerOptions;
}

async function addOrEditDummyAircraftRegisterHandler(db: Db, { id, dummyAircraftRegister }) {
  // const dummyAircraftRegister: DummyAircraftRegisterModel = data.dummyAircraftRegister;

  // do it...

  return { id } as PreplanModel;
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

async function addOrEditFlightRequirementHandler(db: Db, { id, flightRequirement }) {
  // const flightRequirement: Readonly<FlightRequirementModel> = data.flightRequirement;

  // do it...

  return flightRequirement;
}

async function removeFlightRequirementHandler(db: Db, { flightRequirementId }) {
  // do it...

  return true;
}
