import { Router } from 'express';
import { requestMiddlewareWithDbAccess, requestMiddlewareWithTransactionalDbAccess } from 'src/utils/requestMiddleware';
import { Xml } from 'src/utils/xml';
import Id from '@core/types/Id';
import NewPreplanHeaderModel, { NewPreplanHeaderModelValidation } from '@core/models/preplan/NewPreplanHeaderModel';
import PreplanHeaderEntity, { convertPreplanHeaderEntityToModel } from 'src/entities/preplan/PreplanHeaderEntity';
import PreplanModel from '@core/models/preplan/PreplanModel';
import PreplanEntity, {
  convertPreplanEntityToModel,
  parsePreplanDummyAircraftRegistersXml,
  stringifyPreplanDummyAircraftRegistersXml,
  stringifyPreplanAircraftRegisterOptionsXml
} from 'src/entities/preplan/PreplanEntity';
import FlightRequirementEntity, { convertFlightRequirementEntityToModel } from 'src/entities/flight-requirement/FlightRequirementEntity';
import { convertNewPreplanHeaderModelToEntity } from 'src/entities/preplan/NewPreplanHeaderEntity';
import DummyAircraftRegisterModel, { DummyAircraftRegisterModelArrayValidation } from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel, { AircraftRegisterOptionsModelValidation } from '@core/models/preplan/AircraftRegisterOptionsModel';
import FlightEntity, { convertFlightEntityToModel } from 'src/entities/flight/FlightEntity';
import { DbAccess, select } from 'src/utils/sqlServer';
import MasterData from 'src/utils/masterData';
import PreplanHeaderDataModel from '@core/models/preplan/PreplanHeaderDataModel';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';
import PreplanHeaderVersionEntity, { convertPreplanHeaderVersionEntityToDataModel } from 'src/entities/preplan/PreplanHeaderVersionEntity';
import PreplanVersionEntity, { convertPreplanVersionEntityToModel } from 'src/entities/preplan/PreplanVersionEntity';

const router = Router();
export default router;

router.post(
  '/get-all-headers',
  requestMiddlewareWithDbAccess<{}, PreplanHeaderDataModel[]>(async (userId, {}, { runSp }) => {
    return await getPreplanHeaderDataModels(runSp, userId);
  })
);

router.post(
  '/create-empty',
  requestMiddlewareWithDbAccess<{ newPreplan: NewPreplanHeaderModel }, Id>(async (userId, { newPreplan }, { runQuery, runSp }) => {
    const rawUserPreplanHeaderNames = await select<{ name: string }>(runQuery, {
      name: '[Name]'
    })
      .from('[Rpa].[PreplanHeader]')
      .where(`[Id_User] = '${userId}'`);
    const userPreplanHeaderNames = rawUserPreplanHeaderNames.map(item => item.name);
    new NewPreplanHeaderModelValidation(newPreplan, userPreplanHeaderNames).throw('Invalid API input.');

    const newPreplanEntity = convertNewPreplanHeaderModelToEntity(newPreplan);
    const result: { id: Id }[] = await runSp(
      '[Rpa].[SP_InsertEmptyPreplan]',
      runSp.bigIntParam('userId', userId),
      runSp.nVarCharParam('name', newPreplanEntity.name, 200),
      runSp.dateTimeParam('startDate', newPreplanEntity.startDate),
      runSp.dateTimeParam('endDate', newPreplanEntity.endDate)
    );
    const newPreplanId = result[0].id;

    return newPreplanId;
  })
);

router.post(
  '/clone',
  requestMiddlewareWithTransactionalDbAccess<{ id: Id; newPreplan: NewPreplanHeaderModel }, Id>(async (userId, { id, newPreplan }, { runQuery, runSp }) => {
    const rawUserPreplanNames: { name: string }[] = await runQuery(`select [Name] as [name] from [Rpa].[Preplan] where [Id_User] = '${userId}'`);
    const userPreplanNames = rawUserPreplanNames.map(item => item.name);
    new NewPreplanHeaderModelValidation(newPreplan, userPreplanNames).throw('Invalid API input.');

    const newPreplanEntity = convertNewPreplanHeaderModelToEntity(newPreplan);
    const result: { id: Id }[] = await runSp(
      '[Rpa].[SP_ClonePreplan]',
      runSp.bigIntParam('userId', userId),
      runSp.intParam('id', id),
      runSp.nVarCharParam('name', newPreplanEntity.name, 200),
      runSp.dateTimeParam('startDate', newPreplanEntity.startDate),
      runSp.dateTimeParam('endDate', newPreplanEntity.endDate)
    );
    const newPreplanId = result[0].id;

    return newPreplanId;
  })
);

router.post(
  '/commit',
  requestMiddlewareWithDbAccess<{ id: Id; description: string }, PreplanDataModel>(async (userId, { id, description }, { runSp }) => {
    await runSp('[Rpa].[SP_CommitPreplan]', runSp.bigIntParam('userId', userId), runSp.intParam('id', id), runSp.nVarCharParam('name', description, 1000));

    return await getPreplanDataModel(runSp, userId, id);
  })
);

router.post(
  '/edit-header',
  requestMiddlewareWithDbAccess<{ id: Id; newPreplan: NewPreplanHeaderModel }, PreplanHeaderDataModel[]>(async (userId, { id, newPreplan }, { runQuery, runSp }) => {
    const rawUserPreplanNames: { name: string }[] = await runQuery(`select [Name] as [name] from [Rpa].[Preplan] where [Id_User] = '${userId}' and [Id] <> '${id}'`);
    const userPreplanNames = rawUserPreplanNames.map(item => item.name);
    new NewPreplanHeaderModelValidation(newPreplan, userPreplanNames).throw('Invalid API input.');

    const newPreplanEntity = convertNewPreplanHeaderModelToEntity(newPreplan);
    await runSp(
      '[Rpa].[SP_UpdatePreplanHeader]',
      runSp.bigIntParam('userId', userId),
      runSp.intParam('id', id),
      runSp.nVarCharParam('name', newPreplanEntity.name, 200),
      runSp.dateTimeParam('startDate', newPreplanEntity.startDate),
      runSp.dateTimeParam('endDate', newPreplanEntity.endDate)
    );

    return await getPreplanHeaderDataModels(runSp, userId);
  })
);

router.post(
  '/set-published',
  requestMiddlewareWithDbAccess<{ id: Id; published: boolean }, PreplanHeaderDataModel[]>(async (userId, { id, published }, { runSp }) => {
    await runSp('[Rpa].[SP_SetPublished]', runSp.bigIntParam('userId', userId), runSp.intParam('id', id), runSp.bitParam('published', published));

    return await getPreplanHeaderDataModels(runSp, userId);
  })
);

router.post(
  '/remove',
  requestMiddlewareWithTransactionalDbAccess<{ id: Id }, PreplanHeaderDataModel[]>(async (userId, { id }, { runSp }) => {
    await runSp('[Rpa].[SP_DeletePreplan]', runSp.bigIntParam('userId', userId), runSp.intParam('id', id));

    return await getPreplanHeaderDataModels(runSp, userId);
  })
);

router.post(
  '/get',
  requestMiddlewareWithDbAccess<{ id: Id }, PreplanDataModel>(async (userId, { id }, { runSp }) => {
    return await getPreplanDataModel(runSp, userId, id);
  })
);

router.post(
  '/accepted',
  requestMiddlewareWithDbAccess<{ id: Id }, PreplanDataModel>(async (userId, { id }, { runSp }) => {
    await runSp('[Rpa].[SP_SetPreplanAccepted]', runSp.bigIntParam('userId', userId), runSp.intParam('Id', id), runSp.bitParam('accepted', true));

    return await getPreplanDataModel(runSp, userId, id);
  })
);

router.post(
  '/set-aircraft-registers',
  requestMiddlewareWithTransactionalDbAccess<
    {
      id: Id;
      dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
      aircraftRegisterOptions: AircraftRegisterOptionsModel;
    },
    PreplanModel
  >(async (userId, { id, dummyAircraftRegisters, aircraftRegisterOptions }, { runQuery, runSp }) => {
    new DummyAircraftRegisterModelArrayValidation(dummyAircraftRegisters, MasterData.all.aircraftTypes).throw('Invalid API input.');
    const dummyAircraftRegisterIds = dummyAircraftRegisters.map(r => r.id);
    const rawUsedAircraftRegisterIds: readonly { aircraftRegisterId: Id }[] = await runQuery(
      `select f.[Id_AircraftRegister] as [aircraftRegisterId] from [Rpa].[Flight] as f join [Rpa].[FlightRequirement] as r on f.[Id_FlightRequirement] = r.[Id] where r.[Id_Preplan] = '${id}'`
    );
    const usedAircraftRegisterIds: readonly Id[] = rawUsedAircraftRegisterIds.map(i => i.aircraftRegisterId);
    new AircraftRegisterOptionsModelValidation(
      aircraftRegisterOptions,
      MasterData.all.aircraftRegisters,
      MasterData.all.airports,
      dummyAircraftRegisterIds,
      usedAircraftRegisterIds
    ).throw('Invalid API input.');

    // Check for removed dummy aircraft registers usage:
    const rawDummyAircraftRegistersXml: { dummyAircraftRegistersXml: Xml }[] = await runQuery(
      `select [DummyAircraftRegisters] as [dummyAircraftRegistersXml] from [Rpa].[Preplan] where [Id] = '${id}'`
    );
    if (rawDummyAircraftRegistersXml.length === 0) throw 'Preplan is not found.';
    const existingDummyAircraftRegisterIds: Id[] = parsePreplanDummyAircraftRegistersXml(rawDummyAircraftRegistersXml[0].dummyAircraftRegistersXml).map(r => r.id);
    const removedDummyAircraftRegisterIds = existingDummyAircraftRegisterIds.filter(id => !dummyAircraftRegisterIds.includes(id));
    const flightRequirementEntities: FlightRequirementEntity[] = await runSp(
      '[Rpa].[SP_GetFlightRequirements]',
      runSp.bigIntParam('userId', userId),
      runSp.intParam('preplanId', id)
    );
    const flightRequirementModels = flightRequirementEntities.map(convertFlightRequirementEntityToModel);
    const flightRequirementsAircraftRegisterIds = flightRequirementModels
      .map(f =>
        [f.aircraftSelection, ...f.days.map(d => d.aircraftSelection)]
          .map(s => [...s.includedIdentities, ...s.excludedIdentities].filter(i => i.type === 'REGISTER').map(i => i.entityId))
          .flatten()
      )
      .flatten();
    const rawFlightAircraftRegisterIds: { aircraftRegisterId: Id }[] = await runQuery(
      `select convert(varchar(30), f.[Id_AircraftRegister]) as [aircraftRegisterId] from [Rpa].[Flight] as f join [Rpa].[FlightRequirement] as r on r.[Id] = f.[Id_FlightRequirement] where r.[Id_Preplan] = '${id}'`
    );
    const flightAircraftRegisterIds = rawFlightAircraftRegisterIds.map(a => a.aircraftRegisterId);
    if (flightRequirementsAircraftRegisterIds.concat(flightAircraftRegisterIds).some(id => removedDummyAircraftRegisterIds.includes(id)))
      throw `Some of the removing dummy aircraft registers are being used in flight requirements or flights.`;

    const dummyAircraftRegistersXml = stringifyPreplanDummyAircraftRegistersXml(dummyAircraftRegisters);
    const aircraftRegisterOptionsXml = stringifyPreplanAircraftRegisterOptionsXml(aircraftRegisterOptions);
    await runSp(
      '[Rpa].[SP_UpdateAircraftRegisters]',
      runSp.bigIntParam('userId', userId),
      runSp.intParam('preplanId', id),
      runSp.xmlParam('dummyAircraftRegistersXml', dummyAircraftRegistersXml),
      runSp.xmlParam('aircraftRegisterOptionsXml', aircraftRegisterOptionsXml)
    );

    await runSp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', runSp.bigIntParam('userId', userId), runSp.intParam('id', id));

    return await getPreplanDataModel(runSp, userId, id);
  })
);

export async function getPreplanHeaderDataModels(runSp: DbAccess['runSp'], userId: Id): Promise<PreplanHeaderDataModel[]> {
  const preplanHeaderDataEntities: PreplanHeaderVersionEntity[] = await runSp('[Rpa].[SP_GetPreplanHeaderData]', runSp.bigIntParam('userId', userId));
  const preplanHeaderDataModels = preplanHeaderDataEntities.map(convertPreplanHeaderVersionEntityToDataModel);
  return preplanHeaderDataModels;
}

export async function getPreplanDataModel(runSp: DbAccess['runSp'], userId: Id, preplanId: Id): Promise<PreplanDataModel> {
  const rawPreplanHeaderEntities: PreplanHeaderEntity[] = await runSp('[Rpa].[SP_GetPreplanHeader]', runSp.bigIntParam('userId', userId), runSp.intParam('preplanId', preplanId));
  if (rawPreplanHeaderEntities.length === 0) throw 'Preplan is not found.';
  const headerEntity = rawPreplanHeaderEntities[0];
  const header = convertPreplanHeaderEntityToModel(headerEntity);

  const versionEntities: PreplanVersionEntity[] = await runSp('[Rpa].[SP_GetPreplanVersions]', runSp.bigIntParam('userId', userId), runSp.intParam('id', preplanId));
  if (versionEntities.length === 0) throw 'Preplan is not found.';
  const versions = versionEntities.map(convertPreplanVersionEntityToModel);

  const flightRequirementEntities: FlightRequirementEntity[] = await runSp(
    '[Rpa].[SP_GetFlightRequirements]',
    runSp.bigIntParam('userId', userId),
    runSp.intParam('preplanId', preplanId)
  );
  const flightRequirements = flightRequirementEntities.map(convertFlightRequirementEntityToModel);

  const flightEntities: FlightEntity[] = await runSp('[Rpa].[SP_GetFlights]', runSp.bigIntParam('userId', userId), runSp.intParam('preplanId', preplanId));
  const flights = flightEntities.map(convertFlightEntityToModel);

  const rawPreplanEntities: PreplanEntity[] = await runSp('[Rpa].[GetPreplan]', runSp.bigIntParam('userId', userId), runSp.intParam('id', preplanId));
  if (rawPreplanEntities.length === 0) throw 'Preplan is not found.';
  const preplanEntity = rawPreplanEntities[0];
  const preplanModel = convertPreplanEntityToModel(preplanEntity);

  const preplanDataModel: PreplanDataModel = {
    ...preplanModel,
    header,
    versions,
    flightRequirements,
    flights
  };

  return preplanDataModel;
}
