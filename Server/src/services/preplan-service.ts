import { Router } from 'express';
import { requestMiddlewareWithDbAccess } from 'src/utils/requestMiddleware';
import { TYPES } from 'tedious';
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
import FlightRequirementEntity, { convertFlightRequirementModelToEntity, convertFlightRequirementEntityToModel } from 'src/entities/flight-requirement/FlightRequirementEntity';
import FlightRequirementModel, { FlightRequirementModelValidation } from '@core/models/flight-requirement/FlightRequirementModel';
import { convertNewPreplanModelToEntity } from 'src/entities/preplan/NewPreplanEntity';
import NewFlightRequirementModel, { NewFlightRequirementModelValidation } from '@core/models/flight-requirement/NewFlightRequirementModel';
import { convertNewFlightRequirementModelToEntity } from 'src/entities/flight-requirement/NewFlightRequirementEntity';
import DummyAircraftRegisterModel, { DummyAircraftRegisterModelValidation } from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel, { AircraftRegisterOptionsModelValidation } from '@core/models/preplan/AircraftRegisterOptionsModel';

const router = Router();
export default router;

router.post(
  '/get-all-headers',
  requestMiddlewareWithDbAccess<{}, PreplanHeaderModel[]>(async (userId, {}, { runSp }) => {
    const preplanHeaderEntities: PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
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

    const preplanHeaderEntities: PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/set-published',
  requestMiddlewareWithDbAccess<{ id: Id; published: boolean }, PreplanHeaderModel[]>(async (userId, { id, published }, { runSp }) => {
    await runSp('[RPA].[Sp_SetPublished]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id), runSp.bitParam('published', published));

    const preplanHeaderEntities: PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/remove',
  requestMiddlewareWithDbAccess<{ id: Id }, PreplanHeaderModel[]>(async (userId, { id }, { runSp }) => {
    await runSp('[RPA].[Sp_DeletePreplan]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id));

    const preplanHeaderEntities: PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/get',
  requestMiddlewareWithDbAccess<{ id: Id }, PreplanModel>(async (userId, { id }, { runSp }) => {
    const result: PreplanEntity[] = await runSp('[RPA].[SP_GetPreplan]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id));
    if (result.length === 0) throw 'Preplan is not found.';
    const preplanEntity = result[0];

    const flightRequirementEntities: FlightRequirementEntity[] = await runSp(
      '[RPA].[Sp_GetFlightRequirements]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('preplanId', id)
    );

    const preplanModel = convertPreplanEntityToModel(preplanEntity, flightRequirementEntities);
    return preplanModel;
  })
);

router.post(
  '/finalize',
  requestMiddlewareWithDbAccess<{ id: Id }, PreplanModel>(async (userId, { id }, { runSp }) => {
    await runSp('[RPA].[Sp_SetPreplanFinalized]', runSp.varCharParam('userId', userId, 30), runSp.intParam('Id', id), runSp.bitParam('finalized', true));

    const result: PreplanEntity[] = await runSp('[RPA].[SP_GetPreplan]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id));
    if (result.length === 0) throw 'Preplan is not found.';
    const preplanEntity = result[0];

    const flightRequirementEntities: FlightRequirementEntity[] = await runSp(
      '[RPA].[Sp_GetFlightRequirements]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('preplanId', id)
    );

    const preplanModel = convertPreplanEntityToModel(preplanEntity, flightRequirementEntities);
    return preplanModel;
  })
);

router.post(
  '/add-flight-requirement',
  requestMiddlewareWithDbAccess<{ id: Id; newFlightRequirement: NewFlightRequirementModel }, FlightRequirementModel>(
    async (userId, { id, newFlightRequirement }, { runQuery, runSp }) => {
      const rawDummyAircraftRegistersXml: { dummyAircraftRegistersXml: Xml }[] = await runQuery(
        `select [DummyAircraftRegisters] as [dummyAircraftRegistersXml] from [RPA].[Preplan] where [Id] = '${id}'`
      );
      if (rawDummyAircraftRegistersXml.length === 0) throw 'Preplan is not found.';
      const dummyAircraftRegisterIds: Id[] = parsePreplanDummyAircraftRegistersXml(rawDummyAircraftRegistersXml[0].dummyAircraftRegistersXml).map(r => r.id);
      new NewFlightRequirementModelValidation(newFlightRequirement, dummyAircraftRegisterIds).throw('Invalid API input.');

      const newFlightRequirementEntity = convertNewFlightRequirementModelToEntity(newFlightRequirement);
      const result: FlightRequirementEntity[] = await runSp(
        '[RPA].[SP_InsertFlightRequirement]',
        runSp.varCharParam('userId', userId, 30),
        runSp.intParam('preplanId', id),
        runSp.nVarCharParam('label', newFlightRequirementEntity.label, 200),
        runSp.nVarCharParam('category', newFlightRequirementEntity.category, 200),
        runSp.intParam('stcId', newFlightRequirementEntity.stcId),
        runSp.xmlParam('aircraftSelectionXml', newFlightRequirementEntity.aircraftSelectionXml),
        runSp.varCharParam('rsx', newFlightRequirementEntity.rsx, 10),
        runSp.bitParam('required', newFlightRequirementEntity.required),
        runSp.bitParam('ignored', newFlightRequirementEntity.ignored),
        runSp.xmlParam('routeXml', newFlightRequirementEntity.routeXml),
        runSp.xmlParam('daysXml', newFlightRequirementEntity.daysXml)
      );
      const flightRequirementEntity = result[0];

      const flightRequirementModel = convertFlightRequirementEntityToModel(flightRequirementEntity);
      return flightRequirementModel;
    }
  )
);

router.post(
  '/remove-flight-requirement',
  requestMiddlewareWithDbAccess<{ id: Id; flightRequirementId: Id }, void>(async (userId, { id, flightRequirementId }, { runQuery, runSp }) => {
    const rawFlightRequirementIds: { id: Id }[] = await runQuery(`select [Id] as [id] from [RPA].[FlightRequirement] where [Id_Preplan] = '${id}'`);
    const flightRequirementIds = rawFlightRequirementIds.map(item => item.id);
    if (!flightRequirementIds.includes(flightRequirementId)) throw 'Flight requirement is not found.';

    await runSp('[RPA].[Sp_DeleteFlightRequirement]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', flightRequirementId));
  })
);

router.post(
  '/edit-flight-requirements',
  requestMiddlewareWithDbAccess<{ id: Id; flightRequirements: readonly FlightRequirementModel[] }, FlightRequirementModel[]>(
    async (userId, { id, flightRequirements }, { runQuery, runSp }) => {
      const rawFlightRequirementIds: { id: Id }[] = await runQuery(`select [Id] as [id] from [RPA].[FlightRequirement] where [Id_Preplan] = '${id}'`);
      const flightRequirementIds = rawFlightRequirementIds.map(item => item.id);
      const rawDummyAircraftRegistersXml: { dummyAircraftRegistersXml: Xml }[] = await runQuery(
        `select [DummyAircraftRegisters] as [dummyAircraftRegistersXml] from [RPA].[Preplan] where [Id] = '${id}'`
      );
      if (rawDummyAircraftRegistersXml.length === 0) throw 'Preplan is not found.';
      const dummyAircraftRegisterIds: Id[] = parsePreplanDummyAircraftRegistersXml(rawDummyAircraftRegistersXml[0].dummyAircraftRegistersXml).map(r => r.id);
      flightRequirements.forEach(flightRequirement =>
        new FlightRequirementModelValidation(flightRequirement, flightRequirementIds, dummyAircraftRegisterIds).throw('Invalid API input.')
      );

      const updatedFlightRequirementEntities: FlightRequirementEntity[] = await runSp(
        '[RPA].[SP_UpdateFlightRequirements]',
        runSp.varCharParam('userId', userId, 30),
        runSp.tableParam(
          'flightRequirementParameter',
          [
            { name: 'id', type: TYPES.Int },
            { name: 'label', type: TYPES.NVarChar, length: 200 },
            { name: 'category', type: TYPES.NVarChar, length: 200 },
            { name: 'stcId', type: TYPES.Int },
            { name: 'aircraftSelectionXml', type: TYPES.Xml },
            { name: 'rsx', type: TYPES.VarChar, length: 10 },
            { name: 'required', type: TYPES.Bit },
            { name: 'ignored', type: TYPES.Bit },
            { name: 'routeXml', type: TYPES.Xml },
            { name: 'daysXml', type: TYPES.Xml }
          ],
          flightRequirements
            .map(convertFlightRequirementModelToEntity)
            .map<
              [
                FlightRequirementEntity['id'],
                FlightRequirementEntity['label'],
                FlightRequirementEntity['category'],
                FlightRequirementEntity['stcId'],
                FlightRequirementEntity['aircraftSelectionXml'],
                FlightRequirementEntity['rsx'],
                FlightRequirementEntity['required'],
                FlightRequirementEntity['ignored'],
                FlightRequirementEntity['routeXml'],
                FlightRequirementEntity['daysXml']
              ]
            >(flightRequirementEntity => [
              flightRequirementEntity['id'],
              flightRequirementEntity['label'],
              flightRequirementEntity['category'],
              flightRequirementEntity['stcId'],
              flightRequirementEntity['aircraftSelectionXml'],
              flightRequirementEntity['rsx'],
              flightRequirementEntity['required'],
              flightRequirementEntity['ignored'],
              flightRequirementEntity['routeXml'],
              flightRequirementEntity['daysXml']
            ])
        )
      );

      const updatedFlightRequirementModels = updatedFlightRequirementEntities.map(convertFlightRequirementEntityToModel);
      return updatedFlightRequirementModels;
    }
  )
);

router.post(
  '/set-aircraft-registers',
  requestMiddlewareWithDbAccess<
    {
      id: string;
      dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
      aircraftRegisterOptions: AircraftRegisterOptionsModel;
    },
    void
  >(async (userId, { id, dummyAircraftRegisters, aircraftRegisterOptions }, { runQuery, runSp }) => {
    // Validation:
    if (!Array.isArray(dummyAircraftRegisters)) throw 'Invalid API input.';
    const dummyAircraftRegisterIds = dummyAircraftRegisters.map(r => r.id).distinct();
    if (dummyAircraftRegisterIds.length !== dummyAircraftRegisters.length) throw 'Duplicated dummy aircraft register ids.';
    dummyAircraftRegisters.forEach(r => new DummyAircraftRegisterModelValidation(r).throw('Invalid API input.'));
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
    flightRequirementModels.forEach(f => {
      if (
        [
          ...[f.aircraftSelection, ...f.days.map(d => d.aircraftSelection)]
            .map(s => [...s.includedIdentities, ...s.excludedIdentities].filter(i => i.type === 'REGISTER').map(i => i.entityId))
            .flatten(),
          ...f.days.filter(d => d.aircraftRegisterId).map(d => d.aircraftRegisterId)
        ].some(id => removedDummyAircraftRegisterIds.includes(id))
      )
        throw `Some of the removing dummy aircraft registers are being used in flight requirements or flights.`;
    });

    // Apply to database:
    const dummyAircraftRegistersXml = stringifyPreplanDummyAircraftRegistersXml(dummyAircraftRegisters);
    const aircraftRegisterOptionsXml = stringifyPreplanAircraftRegisterOptionsXml(aircraftRegisterOptions);
    await runSp(
      '[RPA].[SP_UpdateAircraftRegisters]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('preplanId', id),
      runSp.xmlParam('dummyAircraftRegistersXml', dummyAircraftRegistersXml),
      runSp.xmlParam('aircraftRegisterOptionsXml', aircraftRegisterOptionsXml)
    );
  })
);
