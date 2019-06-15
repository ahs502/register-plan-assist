import { Router } from 'express';
import { Db } from 'mongodb';
import { asyncDatabaseMiddleware } from '../utils/storage';

import PreplanValidator from '@validators/PreplanValidator';

import { PreplanHeaderModel, PreplanModel } from '@business/Preplan';
import { FlightRequirementModel } from '@business/FlightRequirement';
import { DummyAircraftRegisterModel, AircraftRegisterOptionsDictionary } from '@business/AircraftRegister';
import AutoArrangerOptions from '@business/AutoArrangerOptions';

const router = Router();
export default router;

//TODO: Replace these with a better implementation:
const currentUser = { id: '1001', name: 'MAHANAIR\\123456', displayName: 'Hessamoddin Khan' };

router.post('/get-all-headers', asyncDatabaseMiddleware(getAllHeadersHandler));
router.post('/create-empty', asyncDatabaseMiddleware(createEmptyHandler));
router.post('/clone', asyncDatabaseMiddleware(cloneHandler));
router.post('/get', asyncDatabaseMiddleware(getHandler));
router.post('/edit-header', asyncDatabaseMiddleware(editHeaderHandler));
router.post('/finalize', asyncDatabaseMiddleware(finalizeHandler));
router.post('/remove', asyncDatabaseMiddleware(removeHandler));
router.post('/update-auto-arranger-options', asyncDatabaseMiddleware(updateAutoArrangerOptionsHandler));
router.post('/add-or-edit-dummy-aircraft-register', asyncDatabaseMiddleware(addOrEditDummyAircraftRegisterHandler));
router.post('/remove-dummy-aircraft-register', asyncDatabaseMiddleware(removeDummyAircraftRegisterHandler));
router.post('/update-aircraft-register-options-dictionary', asyncDatabaseMiddleware(updateAircraftRegisterOptionsdictionaryHandler));
router.post('/add-or-edit-flight-requirement', asyncDatabaseMiddleware(addOrEditFlightRequirementHandler));
router.post('/remove-flight-requirement', asyncDatabaseMiddleware(removeFlightRequirementHandler));

async function getAllHeadersHandler(data: any, db: Db) {
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
  });
  const result: PreplanHeaderModel[] = raw;

  return result;
}

async function createEmptyHandler(data: any, db: Db) {
  const name: string = data.name;
  const startDate: Date = new Date(data.startDate);
  const endDate: Date = new Date(data.endDate);
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
    startDate,
    endDate,
    simulationId: undefined,
    simulationName: undefined,
    autoArrangerOptions: undefined,
    dummyAircraftRegisters: [],
    aircraftRegisterOptionsDictionary: {}
  };

  //const result = await db.collection('preplans').insertOne(preplan);
  //const id = result.insertedId.toHexString();
  const id = 'sdfdsfsdfdsfdsfsdfsdf';

  return id;
}

async function cloneHandler(data: any, db: Db) {
  const id: string = data.id;
  const name: string = data.name;
  const startDate: Date = new Date(data.startDate);
  const endDate: Date = new Date(data.endDate);

  // do it...

  return '12345489';
}

async function getHandler(data: any, db: Db) {
  const id: string = data.id;

  // do it...

  return { id } as PreplanModel;
}

async function editHeaderHandler(data: any, db: Db) {
  const id: string = data.id;
  const name: string = data.id;
  const published: boolean = data.id;
  const startDate: Date = new Date(data.id);
  const endDate: Date = new Date(data.id);

  // do it...

  return [] as PreplanHeaderModel[];
}

async function finalizeHandler(data: any, db: Db) {
  const id: string = data.id;

  // do it...

  return { id } as PreplanModel;
}

async function removeHandler(data: any, db: Db) {
  const id: string = data.id;

  // do it...

  return true;
}

async function updateAutoArrangerOptionsHandler(data: any, db: Db) {
  const id: string = data.id;
  const autoArrangerOptions: Readonly<AutoArrangerOptions> = data.autoArrangerOptions;

  // do it...

  return autoArrangerOptions;
}

async function addOrEditDummyAircraftRegisterHandler(data: any, db: Db) {
  const id: string = data.id;
  const dummyAircraftRegister: DummyAircraftRegisterModel = data.dummyAircraftRegister;

  // do it...

  return { id } as PreplanModel;
}

async function removeDummyAircraftRegisterHandler(data: any, db: Db) {
  const dummyAircraftRegisterId: string = data.dummyAircraftRegisterId;

  // do it...

  return {} as PreplanModel;
}

async function updateAircraftRegisterOptionsdictionaryHandler(data: any, db: Db) {
  const id: string = data.id;
  const aircraftRegisterOptionsDictionary: Readonly<AircraftRegisterOptionsDictionary> = data.aircraftRegisterOptionsDictionary;

  // do it...

  return { id } as PreplanModel;
}

async function addOrEditFlightRequirementHandler(data: any, db: Db) {
  const id: string = data.id;
  const flightRequirement: Readonly<FlightRequirementModel> = data.flightRequirement;

  // do it...

  return flightRequirement;
}

async function removeFlightRequirementHandler(data: any, db: Db) {
  const flightRequirementId: string = data.flightRequirementId;

  // do it...

  return true;
}
