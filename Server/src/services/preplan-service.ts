import { Router } from 'express';
import { requestMiddlewareWithDb, requestMiddlewareWithTransactionalDb } from 'src/utils/requestMiddleware';
import { Xml } from 'src/utils/xml';
import Id from '@core/types/Id';
import PreplanHeaderEntity, { convertPreplanHeaderEntityToModel } from 'src/entities/preplan/PreplanHeaderEntity';
import PreplanEntity, {
  convertPreplanEntityToModel,
  parsePreplanDummyAircraftRegistersXml,
  stringifyPreplanDummyAircraftRegistersXml,
  stringifyPreplanAircraftRegisterOptionsXml
} from 'src/entities/preplan/PreplanEntity';
import FlightRequirementEntity, { convertFlightRequirementEntityToModel } from 'src/entities/flight-requirement/FlightRequirementEntity';
import DummyAircraftRegisterModel, { DummyAircraftRegisterModelArrayValidation } from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel, { AircraftRegisterOptionsModelValidation } from '@core/models/preplan/AircraftRegisterOptionsModel';
import FlightEntity, { convertFlightEntityToModel } from 'src/entities/flight/FlightEntity';
import { Db } from 'src/utils/sqlServer';
import MasterData from 'src/utils/masterData';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';
import PreplanVersionEntity, { convertPreplanVersionEntityToModel } from 'src/entities/preplan/PreplanVersionEntity';

const router = Router();
export default router;

router.post(
  '/commit',
  requestMiddlewareWithTransactionalDb<{ id: Id; description: string }, PreplanDataModel>(async (userId, { id, description }, db) => {
    const { current, ownerUserId } = await db
      .select<{ current: boolean; ownerUserId: Id }>({ current: 'p.[Current]', ownerUserId: 'h.[Id_User]' })
      .from('[Rpa].[Preplan] as p join [Rpa].[PreplanHeader] as h on h.[Id] = p.[Id_PreplanHeader]')
      .where(`p.[Id] = '${id}'`)
      .one('Preplan is not found.');
    if (ownerUserId !== userId) throw 'User does not own this preplan.';
    if (!current) throw 'Only current preplan can be committed.';

    await db.sp('[Rpa].[SP_CommitPreplan]', db.bigIntParam('userId', userId), db.intParam('id', id), db.nVarCharParam('description', description, 1000)).all();

    return await getPreplanDataModel(db, userId, id);
  })
);

router.post(
  '/get',
  requestMiddlewareWithDb<{ id: Id }, PreplanDataModel>(async (userId, { id }, db) => {
    return await getPreplanDataModel(db, userId, id);
  })
);

router.post(
  '/accept',
  requestMiddlewareWithTransactionalDb<{ id: Id }, PreplanDataModel>(async (userId, { id }, db) => {
    await db.sp('[Rpa].[SP_AcceptPreplanHeader]', db.bigIntParam('userId', userId), db.intParam('preplanId', id)).all();

    return await getPreplanDataModel(db, userId, id);
  })
);

router.post(
  '/remove',
  requestMiddlewareWithTransactionalDb<{ id: Id }, PreplanDataModel>(async (userId, { id }, db) => {
    await db.sp('[Rpa].[SP_DeletePreplan]', db.bigIntParam('userId', userId), db.intParam('id', id)).all();

    return await getPreplanDataModel(db, userId, id);
  })
);

router.post(
  '/set-aircraft-registers',
  requestMiddlewareWithTransactionalDb<
    {
      id: Id;
      dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
      aircraftRegisterOptions: AircraftRegisterOptionsModel;
    },
    PreplanDataModel
  >(async (userId, { id, dummyAircraftRegisters, aircraftRegisterOptions }, db) => {
    new DummyAircraftRegisterModelArrayValidation(dummyAircraftRegisters, MasterData.all.aircraftTypes).throw('Invalid API input.');

    const dummyAircraftRegisterIds = dummyAircraftRegisters.map(r => r.id);
    const usedAircraftRegisterIds = await db
      .select<{ aircraftRegisterId: Id }>({ aircraftRegisterId: 'f.[Id_AircraftRegister]' })
      .from('[Rpa].[Flight] as f join [Rpa].[FlightRequirement] as r on f.[Id_FlightRequirement] = r.[Id]')
      .where(`r.[Id_Preplan] = '${id}'`)
      .map(({ aircraftRegisterId }) => aircraftRegisterId);
    new AircraftRegisterOptionsModelValidation(
      aircraftRegisterOptions,
      MasterData.all.aircraftRegisters,
      MasterData.all.airports,
      dummyAircraftRegisterIds,
      usedAircraftRegisterIds
    ).throw('Invalid API input.');

    // Check for removed dummy aircraft registers usage:
    const existingDummyAircraftRegisterIds = await db
      .select<{ dummyAircraftRegistersXml: Xml }>({ dummyAircraftRegistersXml: '[DummyAircraftRegisters]' })
      .from('[Rpa].[Preplan]')
      .where(`[Id] = '${id}'`)
      .pick(({ dummyAircraftRegistersXml }) => parsePreplanDummyAircraftRegistersXml(dummyAircraftRegistersXml).map(r => r.id), 'Preplan is not found.');
    const removedDummyAircraftRegisterIds = existingDummyAircraftRegisterIds.filter(id => !dummyAircraftRegisterIds.includes(id));
    const flightRequirementModels = await db
      .sp<FlightRequirementEntity>('[Rpa].[SP_GetFlightRequirements]', db.bigIntParam('userId', userId), db.intParam('preplanId', id))
      .map(convertFlightRequirementEntityToModel);
    const flightRequirementsAircraftRegisterIds = flightRequirementModels
      .map(f =>
        [f.aircraftSelection, ...f.days.map(d => d.aircraftSelection)]
          .map(s => [...s.includedIdentities, ...s.excludedIdentities].filter(i => i.type === 'REGISTER').map(i => i.entityId))
          .flatten()
      )
      .flatten();
    const flightAircraftRegisterIds = await db
      .select<{ aircraftRegisterId: Id }>({ aircraftRegisterId: 'convert(varchar(30), f.[Id_AircraftRegister])' })
      .from('[Rpa].[Flight] as f join [Rpa].[FlightRequirement] as r on r.[Id] = f.[Id_FlightRequirement]')
      .where(`r.[Id_Preplan] = '${id}'`)
      .map(({ aircraftRegisterId }) => aircraftRegisterId);
    if (flightRequirementsAircraftRegisterIds.concat(flightAircraftRegisterIds).some(id => removedDummyAircraftRegisterIds.includes(id)))
      throw `Some of the removing dummy aircraft registers are being used in flight requirements or flights.`;

    const dummyAircraftRegistersXml = stringifyPreplanDummyAircraftRegistersXml(dummyAircraftRegisters);
    const aircraftRegisterOptionsXml = stringifyPreplanAircraftRegisterOptionsXml(aircraftRegisterOptions);
    await db
      .sp(
        '[Rpa].[SP_UpdatePreplanAircraftRegisters]',
        db.bigIntParam('userId', userId),
        db.intParam('id', id),
        db.xmlParam('dummyAircraftRegistersXml', dummyAircraftRegistersXml),
        db.xmlParam('aircraftRegisterOptionsXml', aircraftRegisterOptionsXml)
      )
      .all();

    await db.sp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', db.bigIntParam('userId', userId), db.intParam('id', id)).all();

    return await getPreplanDataModel(db, userId, id);
  })
);

export async function getPreplanDataModel(db: Db, userId: Id, preplanId: Id): Promise<PreplanDataModel> {
  const header = await db
    .sp<PreplanHeaderEntity>('[Rpa].[SP_GetPreplanHeader]', db.bigIntParam('userId', userId), db.intParam('preplanId', preplanId))
    .pick(convertPreplanHeaderEntityToModel, 'Preplan is not found.');
  if (header.user.id !== userId && !header.published) throw 'User does not have access to this preplan.';

  const preplan = await db
    .sp<PreplanEntity>('[Rpa].[SP_GetPreplan]', db.bigIntParam('userId', userId), db.intParam('id', preplanId))
    .pick(convertPreplanEntityToModel, 'Preplan is not found.');

  const versions = await db
    .sp<PreplanVersionEntity>('[Rpa].[SP_GetPreplanVersions]', db.bigIntParam('userId', userId), db.intParam('id', preplanId))
    .map(convertPreplanVersionEntityToModel, 'Preplan is not found.');

  const flightRequirements = await db
    .sp<FlightRequirementEntity>('[Rpa].[SP_GetFlightRequirements]', db.bigIntParam('userId', userId), db.intParam('preplanId', preplanId))
    .map(convertFlightRequirementEntityToModel);

  const flights = await db.sp<FlightEntity>('[Rpa].[SP_GetFlights]', db.bigIntParam('userId', userId), db.intParam('preplanId', preplanId)).map(convertFlightEntityToModel);

  const preplanDataModel: PreplanDataModel = {
    header,
    preplan,
    versions,
    flightRequirements,
    flights
  };

  return preplanDataModel;
}
