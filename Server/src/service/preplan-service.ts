import { Router } from 'express';
import asyncMiddleware from '../utils/asyncMiddleware';

import { PreplanHeaderModel, PreplanModel } from '@business/Preplan';
import { FlightRequirementModel } from '@business/FlightRequirement';
import { DummyAircraftRegisterModel, AircraftRegisterOptionsDictionary } from '@business/AircraftRegister';
import AutoArrangerOptions from '@business/AutoArrangerOptions';

const router = Router();
export default router;

router.post(
  '/get-all-headers',
  asyncMiddleware(async data => {
    return [] as PreplanHeaderModel[];
  })
);

router.post(
  '/create-empty',
  asyncMiddleware(async data => {
    const name: string = data.name;
    const startDate: Date = new Date(data.startDate);
    const endDate: Date = new Date(data.endDate);

    // do it...

    return '12345489';
  })
);

router.post(
  '/clone',
  asyncMiddleware(async data => {
    const id: string = data.id;
    const name: string = data.name;
    const startDate: Date = new Date(data.startDate);
    const endDate: Date = new Date(data.endDate);

    // do it...

    return '12345489';
  })
);

router.post(
  '/get',
  asyncMiddleware(async data => {
    const id: string = data.id;

    // do it...

    return { id } as PreplanModel;
  })
);

router.post(
  '/edit-header',
  asyncMiddleware(async data => {
    const id: string = data.id;
    const name: string = data.id;
    const published: boolean = data.id;
    const startDate: Date = new Date(data.id);
    const endDate: Date = new Date(data.id);

    // do it...

    return [] as PreplanHeaderModel[];
  })
);

router.post(
  '/finalize',
  asyncMiddleware(async data => {
    const id: string = data.id;

    // do it...

    return { id } as PreplanModel;
  })
);

router.post(
  '/remove',
  asyncMiddleware(async data => {
    const id: string = data.id;

    // do it...

    return true;
  })
);

router.post(
  '/update-auto-arranger-options',
  asyncMiddleware(async data => {
    const id: string = data.id;
    const autoArrangerOptions: Readonly<AutoArrangerOptions> = data.autoArrangerOptions;

    // do it...

    return autoArrangerOptions;
  })
);

router.post(
  '/add-or-edit-dummy-aircraft-register',
  asyncMiddleware(async data => {
    const id: string = data.id;
    const dummyAircraftRegister: DummyAircraftRegisterModel = data.dummyAircraftRegister;

    // do it...

    return { id } as PreplanModel;
  })
);

router.post(
  '/remove-dummy-aircraft-register',
  asyncMiddleware(async data => {
    const dummyAircraftRegisterId: string = data.dummyAircraftRegisterId;

    // do it...

    return {} as PreplanModel;
  })
);

router.post(
  '/update-aircraft-register-options-dictionary',
  asyncMiddleware(async data => {
    const id: string = data.id;
    const aircraftRegisterOptionsDictionary: Readonly<AircraftRegisterOptionsDictionary> = data.aircraftRegisterOptionsDictionary;

    // do it...

    return { id } as PreplanModel;
  })
);

router.post(
  '/add-or-edit-flight-requirement',
  asyncMiddleware(async data => {
    const id: string = data.id;
    const flightRequirement: Readonly<FlightRequirementModel> = data.flightRequirement;

    // do it...

    return flightRequirement;
  })
);

router.post(
  '/remove-flight-requirement',
  asyncMiddleware(async data => {
    const flightRequirementId: string = data.flightRequirementId;

    // do it...

    return true;
  })
);
