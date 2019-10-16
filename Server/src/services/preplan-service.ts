import { Router } from 'express';
import { requestMiddlewareWithDbAccess, requestMiddlewareWithTransactionalDbAccess } from 'src/utils/requestMiddleware';
import { Xml } from 'src/utils/xml';
import Id from '@core/types/Id';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import NewPreplanModel, { NewPreplanModelValidation } from '@core/models/preplan/NewPreplanModel';
import PreplanHeaderEntity, { convertPreplanHeaderEntityToModel } from 'src/entities/preplan/PreplanHeaderEntity';
import PreplanModel from '@core/models/preplan/PreplanModel';
import PreplanEntity, {
  convertPreplanEntityToModel,
  parsePreplanDummyAircraftRegistersXml,
  stringifyPreplanDummyAircraftRegistersXml,
  stringifyPreplanAircraftRegisterOptionsXml
} from 'src/entities/preplan/PreplanEntity';
import FlightRequirementEntity, { convertFlightRequirementEntityToModel } from 'src/entities/flight-requirement/FlightRequirementEntity';
import { convertNewPreplanModelToEntity } from 'src/entities/preplan/NewPreplanEntity';
import DummyAircraftRegisterModel, { DummyAircraftRegisterModelArrayValidation } from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel, { AircraftRegisterOptionsModelValidation } from '@core/models/preplan/AircraftRegisterOptionsModel';
import FlightEntity from 'src/entities/flight/FlightEntity';
import { DbAccess } from 'src/utils/sqlServer';

const router = Router();
export default router;

router.post(
  '/get-all-headers',
  requestMiddlewareWithDbAccess<{}, PreplanHeaderModel[]>(async (userId, {}, { runSp }) => {
    return await getPreplanHeaderModels(runSp, userId);
  })
);

router.post(
  '/create-empty',
  requestMiddlewareWithDbAccess<{ newPreplan: NewPreplanModel }, Id>(async (userId, { newPreplan }, { runQuery, runSp }) => {
    const rawUserPreplanNames: { name: string }[] = await runQuery(`select [Name] as [name] from [RPA].[Preplan] where [Id_User] = '${userId}'`);
    const userPreplanNames = rawUserPreplanNames.map(item => item.name);
    new NewPreplanModelValidation(newPreplan, userPreplanNames).throw('Invalid API input.');

    const newPreplanEntity = convertNewPreplanModelToEntity(newPreplan);
    const result: { id: Id }[] = await runSp(
      '[RPA].[SP_InsertEmptyPreplan]',
      runSp.varCharParam('userId', userId, 30),
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
  requestMiddlewareWithDbAccess<{ id: Id; newPreplan: NewPreplanModel }, Id>(async (userId, { id, newPreplan }, { runQuery, runSp }) => {
    const rawUserPreplanNames: { name: string }[] = await runQuery(`select [Name] as [name] from [RPA].[Preplan] where [Id_User] = '${userId}'`);
    const userPreplanNames = rawUserPreplanNames.map(item => item.name);
    new NewPreplanModelValidation(newPreplan, userPreplanNames).throw('Invalid API input.');

    const newPreplanEntity = convertNewPreplanModelToEntity(newPreplan);
    const result: { id: Id }[] = await runSp(
      '[RPA].[SP_ClonePreplan]',
      runSp.varCharParam('userId', userId, 30),
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
  '/edit-header',
  requestMiddlewareWithDbAccess<{ id: Id; newPreplan: NewPreplanModel }, PreplanHeaderModel[]>(async (userId, { id, newPreplan }, { runQuery, runSp }) => {
    const rawUserPreplanNames: { name: string }[] = await runQuery(`select [Name] as [name] from [RPA].[Preplan] where [Id_User] = '${userId}' and [Id] <> '${id}'`);
    const userPreplanNames = rawUserPreplanNames.map(item => item.name);
    new NewPreplanModelValidation(newPreplan, userPreplanNames).throw('Invalid API input.');

    const newPreplanEntity = convertNewPreplanModelToEntity(newPreplan);
    await runSp(
      '[RPA].[Sp_UpdatePreplanHeader]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('id', id),
      runSp.nVarCharParam('name', newPreplanEntity.name, 200),
      runSp.dateTimeParam('startDate', newPreplanEntity.startDate),
      runSp.dateTimeParam('endDate', newPreplanEntity.endDate)
    );

    return await getPreplanHeaderModels(runSp, userId);
  })
);

router.post(
  '/set-published',
  requestMiddlewareWithDbAccess<{ id: Id; published: boolean }, PreplanHeaderModel[]>(async (userId, { id, published }, { runSp }) => {
    await runSp('[RPA].[Sp_SetPublished]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id), runSp.bitParam('published', published));

    return await getPreplanHeaderModels(runSp, userId);
  })
);

router.post(
  '/remove',
  requestMiddlewareWithDbAccess<{ id: Id }, PreplanHeaderModel[]>(async (userId, { id }, { runSp }) => {
    await runSp('[RPA].[Sp_DeletePreplan]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id));

    return await getPreplanHeaderModels(runSp, userId);
  })
);

router.post(
  '/get',
  requestMiddlewareWithDbAccess<{ id: Id }, PreplanModel>(async (userId, { id }, { runSp }) => {
    return await getPreplanModel(runSp, userId, id);
  })
);

router.post(
  '/finalize',
  requestMiddlewareWithDbAccess<{ id: Id }, PreplanModel>(async (userId, { id }, { runSp }) => {
    await runSp('[RPA].[Sp_SetPreplanFinalized]', runSp.varCharParam('userId', userId, 30), runSp.intParam('Id', id), runSp.bitParam('finalized', true));

    return await getPreplanModel(runSp, userId, id);
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
    new DummyAircraftRegisterModelArrayValidation(dummyAircraftRegisters).throw('Invalid API input.');
    const dummyAircraftRegisterIds = dummyAircraftRegisters.map(r => r.id);
    new AircraftRegisterOptionsModelValidation(aircraftRegisterOptions, dummyAircraftRegisterIds).throw('Invalid API input.');

    // Check for removed dummy aircraft registers usage:
    const rawDummyAircraftRegistersXml: { dummyAircraftRegistersXml: Xml }[] = await runQuery(
      `select [DummyAircraftRegisters] as [dummyAircraftRegistersXml] from [RPA].[Preplan] where [Id] = '${id}'`
    );
    if (rawDummyAircraftRegistersXml.length === 0) throw 'Preplan is not found.';
    const existingDummyAircraftRegisterIds: Id[] = parsePreplanDummyAircraftRegistersXml(rawDummyAircraftRegistersXml[0].dummyAircraftRegistersXml).map(r => r.id);
    const removedDummyAircraftRegisterIds = existingDummyAircraftRegisterIds.filter(id => !dummyAircraftRegisterIds.includes(id));
    const flightRequirementEntities: FlightRequirementEntity[] = await runSp(
      '[RPA].[Sp_GetFlightRequirements]',
      runSp.varCharParam('userId', userId, 30),
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
      `select f.[Id_AircraftRegister] as [aircraftRegisterId] from [RPA].[Flight] as f join [RPA].[FlightRequirement] as r where r.[Id_Preplan] = '${id}'`
    );
    const flightAircraftRegisterIds = rawFlightAircraftRegisterIds.map(a => a.aircraftRegisterId);
    if (flightRequirementsAircraftRegisterIds.concat(flightAircraftRegisterIds).some(id => removedDummyAircraftRegisterIds.includes(id)))
      throw `Some of the removing dummy aircraft registers are being used in flight requirements or flights.`;

    const dummyAircraftRegistersXml = stringifyPreplanDummyAircraftRegistersXml(dummyAircraftRegisters);
    const aircraftRegisterOptionsXml = stringifyPreplanAircraftRegisterOptionsXml(aircraftRegisterOptions);
    await runSp(
      '[RPA].[SP_UpdateAircraftRegisters]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('preplanId', id),
      runSp.xmlParam('dummyAircraftRegistersXml', dummyAircraftRegistersXml),
      runSp.xmlParam('aircraftRegisterOptionsXml', aircraftRegisterOptionsXml)
    );

    await runSp('[RPA].[SP_UpdatePreplanLastEditDateTime]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id));

    return await getPreplanModel(runSp, userId, id);
  })
);

export async function getPreplanHeaderModels(runSp: DbAccess['runSp'], userId: Id): Promise<PreplanHeaderModel[]> {
  const preplanHeaderEntities: PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
  const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
  return preplanHeaderModels;
}

export async function getPreplanModel(runSp: DbAccess['runSp'], userId: Id, preplanId: Id): Promise<PreplanModel> {
  const result: PreplanEntity[] = await runSp('[RPA].[SP_GetPreplan]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', preplanId));
  if (result.length === 0) throw 'Preplan is not found.';
  const preplanEntity = result[0];

  const flightRequirementEntities: FlightRequirementEntity[] = await runSp(
    '[RPA].[Sp_GetFlightRequirements]',
    runSp.varCharParam('userId', userId, 30),
    runSp.intParam('preplanId', preplanId)
  );

  const flightEntities: FlightEntity[] = await runSp('[RPA].[Sp_GetFlights]', runSp.varCharParam('userId', userId, 30), runSp.intParam('preplanId', preplanId));

  const preplanModel = convertPreplanEntityToModel(preplanEntity, flightRequirementEntities, flightEntities);
  return preplanModel;
}
