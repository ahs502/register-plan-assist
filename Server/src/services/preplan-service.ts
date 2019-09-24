import { Router } from 'express';
import PreplanEntity, { convertPreplanEntityToModel } from 'src/entities/PreplanEntity';
import { PreplanHeaderEntity, convertPreplanHeaderEntityToModel } from 'src/entities/PreplanHeadersEntity';
import { DbAccess } from 'src/utils/sqlServer';
import FlightRequirementEntity, { convertFlightRequirementEntityToModel } from 'src/entities/flight/FlightRequirementEntity';
import PreplanModel, { PreplanHeaderModel } from '@core/models/PreplanModel';
import { requestMiddlewareWithDbAccess } from 'src/utils/requestMiddleware';
import NewPreplanModel, { NewPreplanModelValidation } from '@core/models/NewPreplanModel';
import EditPreplanModel from '@core/models/EditPreplanModel';
import FlightRequirementModel from '@core/models/flights/FlightRequirementModel';
import { TYPES } from 'tedious';
import { convertFlightScopeModelToEntity } from 'src/entities/flight/FlightScopeEntity';
import { xmlStringify } from 'src/utils/xml';
import { convertWeekdayFlightRequirementListModelToEntity } from 'src/entities/flight/WeekdayFlightRequirementListEntity';
import DummyAircraftRegisterModel from '@core/models/DummyAircraftRegisterModel';
import { AircraftRegisterOptionsDictionaryModel } from '@core/models/AircraftRegisterOptionsModel';
import { convertDummyAircraftRegisterListModelToEntity } from 'src/entities/DummyAircraftRegisterListEntity';
import { convertAircraftRegisterOptionsListModelToEntity } from 'src/entities/AircraftRegisterOptionsListEntity';

const router = Router();
export default router;

router.post(
  '/get-all-headers',
  requestMiddlewareWithDbAccess<{}, PreplanHeaderModel[]>(async (userId, {}, { runSp }) => {
    const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
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
      '[RPA].[SP_InsertEmptyPreplan]',
      runSp.varCharParam('userId', userId, 30),
      runSp.nVarCharParam('name', newPreplan.name, 200),
      runSp.dateTimeParam('startDate', newPreplan.startDate),
      runSp.dateTimeParam('endDate', newPreplan.endDate)
    );
    const newPreplanId = result[0] as any;

    return newPreplanId.id;
  })
);

router.post(
  '/clone',
  requestMiddlewareWithDbAccess<{ id: string; newPreplan: NewPreplanModel }, string>(async (userId, { id, newPreplan }, { runSp, runQuery }) => {
    const userPreplanNames: string[] = await runQuery(`select [Name] from [RPA].[Preplan] where [Id_User] = '${userId}'`);
    new NewPreplanModelValidation(newPreplan, userPreplanNames).throw('Invalid API input.');

    const result: string[] = await runSp(
      '[RPA].[SP_ClonePreplan]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('id', id),
      runSp.nVarCharParam('name', newPreplan.name, 200),
      runSp.dateTimeParam('startDate', newPreplan.startDate),
      runSp.dateTimeParam('endDate', newPreplan.endDate)
    );
    const newPreplanId = result[0] as any;

    return newPreplanId.id;
  })
);

router.post(
  '/edit-header',
  requestMiddlewareWithDbAccess<EditPreplanModel, PreplanHeaderModel[]>(async (userId, editPreplan, { runSp, runQuery }) => {
    const userPreplanNames: string[] = await runQuery(`select [Name] from [RPA].[Preplan] where [Id_User] = '${userId}' and [Id] <> '${editPreplan.id}'`);
    new NewPreplanModelValidation(editPreplan, userPreplanNames).throw('Invalid API input.');

    const preplanHeaderEntity: PreplanHeaderEntity[] = await runSp(
      '[RPA].[Sp_UpdatePreplanHeader]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('id', editPreplan.id),
      runSp.nVarCharParam('name', editPreplan.name, 200),
      runSp.dateTimeParam('startDate', editPreplan.startDate),
      runSp.dateTimeParam('endDate', editPreplan.endDate)
    );

    const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/set-published',
  requestMiddlewareWithDbAccess<{ id: string; published: boolean }, PreplanHeaderModel[]>(async (userId, { id, published }, { runSp }) => {
    await runSp('[RPA].[Sp_SetPublished]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id), runSp.bitParam('published', published));

    const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

router.post(
  '/remove',
  requestMiddlewareWithDbAccess<{ id: string }, PreplanHeaderModel[]>(async (userId, { id }, { runSp }) => {
    await runSp('[RPA].[Sp_DeletePreplan]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id));

    const preplanHeaderEntities: readonly PreplanHeaderEntity[] = await runSp('[RPA].[SP_GetPreplanHeaders]', runSp.varCharParam('userId', userId, 30));
    const preplanHeaderModels = preplanHeaderEntities.map(convertPreplanHeaderEntityToModel);
    return preplanHeaderModels;
  })
);

// hessam ==> validation ==> input XXModel
router.post(
  '/get',
  requestMiddlewareWithDbAccess<{ id: string }, PreplanModel>(async (userId, { id }, { runSp }) => {
    const preplan: PreplanEntity | undefined = (await runSp('[RPA].[SP_GetPreplan]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id)))[0];
    if (!preplan) throw 'Preplan is not found.';

    const flightRequirements: FlightRequirementEntity[] = await runSp('[RPA].[Sp_GetFlightRequirement]', runSp.varCharParam('userId', userId, 30), runSp.intParam('preplanId', id));

    const result: PreplanModel = await convertPreplanEntityToModel(preplan, flightRequirements);
    return result;
  })
);

router.post(
  '/finalize',
  requestMiddlewareWithDbAccess<{ id: string }, PreplanModel>(async (userId, { id }, { runSp }) => {
    // PreplanValidator
    const Preplans: readonly PreplanEntity[] = await runSp(
      '[RPA].[Sp_SetPreplanFinalized]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('Id', id),
      runSp.bitParam('finalized', true)
    );
    const preplan: PreplanEntity | null = Preplans[0];

    const flightRequirements: readonly FlightRequirementEntity[] = await runSp(
      '[RPA].[Sp_GetFlightRequirement]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('preplanId', id)
    );

    const result: PreplanModel = await convertPreplanEntityToModel(preplan, flightRequirements);
    return result;
  })
);

router.post(
  '/add-flight-requirement',
  requestMiddlewareWithDbAccess<{ id: string; flightRequirement: FlightRequirementModel }, FlightRequirementModel>(async (userId, { id, flightRequirement }, { runSp }) => {
    //TODO: Validator

    const newFlightRequirements: FlightRequirementEntity[] = await runSp(
      '[RPA].[SP_InsertFlightRequirement]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('preplanId', id),
      runSp.nVarCharParam('scope', xmlStringify(convertFlightScopeModelToEntity(flightRequirement.scope), 'Scope'), 'max'),
      runSp.nVarCharParam('days', xmlStringify(convertWeekdayFlightRequirementListModelToEntity(flightRequirement.days), 'WeekdayFlightRequirements'), 'max'),
      runSp.bitParam('ignored', flightRequirement.ignored),
      runSp.nVarCharParam('label', flightRequirement.definition.label, 200),
      runSp.nVarCharParam('category', flightRequirement.definition.category, 200),
      runSp.intParam('stcId', flightRequirement.definition.stcId),
      runSp.nVarCharParam('flightNumber', flightRequirement.definition.flightNumber, 10),
      runSp.varCharParam('departureAirportId', flightRequirement.definition.departureAirportId, 30),
      runSp.varCharParam('arrivalAirportId', flightRequirement.definition.arrivalAirportId, 30)
    );
    const newFlightRequirement = newFlightRequirements[0];
    const result: FlightRequirementModel = convertFlightRequirementEntityToModel(newFlightRequirement);
    return result;
  })
);

router.post(
  '/remove-flight-requirement',
  requestMiddlewareWithDbAccess<{ flightRequirementId: string }, void>(async (userId, { flightRequirementId }, { runSp }) => {
    await runSp('[RPA].[Sp_DeleteFlightRequirement]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', flightRequirementId));
  })
);

router.post(
  '/edit-flight-requirements',
  requestMiddlewareWithDbAccess<{ flightRequirements: readonly FlightRequirementModel[] }, FlightRequirementModel[]>(async (userId, { flightRequirements }, { runSp }) => {
    const rawFlightRequirements: any[][] = flightRequirements.map(f => [
      f.id,
      xmlStringify(convertFlightScopeModelToEntity(f.scope), 'Scope'),
      xmlStringify(convertWeekdayFlightRequirementListModelToEntity(f.days), 'WeekdayFlightRequirements'),
      f.ignored,
      f.definition.label,
      f.definition.category,
      f.definition.stcId,
      f.definition.flightNumber,
      f.definition.departureAirportId,
      f.definition.arrivalAirportId
    ]);

    const updatedFlightRequirement: FlightRequirementEntity[] = await runSp(
      '[RPA].[SP_UpdateFlightRequirements]',
      runSp.varCharParam('userId', userId, 30),
      runSp.tableParam(
        'flightRequirementParameter',
        [
          { name: 'id', type: TYPES.Int },
          { name: 'scope', type: TYPES.NVarChar },
          { name: 'days', type: TYPES.NVarChar },
          { name: 'ignored', type: TYPES.Bit },
          { name: 'lable', type: TYPES.NVarChar, length: 100 },
          { name: 'category', type: TYPES.NVarChar, length: 100 },
          { name: 'stcId', type: TYPES.Int },
          { name: 'flightNumber', type: TYPES.VarChar, length: 10 },
          { name: 'departureAirportId', type: TYPES.VarChar },
          { name: 'arrivalAirportId', type: TYPES.VarChar }
        ],
        rawFlightRequirements
      )
    );

    const result = updatedFlightRequirement.map(convertFlightRequirementEntityToModel);
    return result;
  })
);

router.post(
  '/set-aircraft-registers',
  requestMiddlewareWithDbAccess<
    {
      id: string;
      dummyAircraftRegisters: readonly DummyAircraftRegisterModel[];
      aircraftRegisterOptionsDictionary: AircraftRegisterOptionsDictionaryModel;
    },
    void
  >(async (userId, { id, dummyAircraftRegisters, aircraftRegisterOptionsDictionary }, { runSp }) => {
    await runSp(
      '[RPA].[SP_UpdateAircraftRegisters]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('id', id),
      runSp.nVarCharParam('dummyAircraftRegisters', xmlStringify(convertDummyAircraftRegisterListModelToEntity(dummyAircraftRegisters), 'DummyAircraftRegisters'), 'max'),
      runSp.nVarCharParam(
        'AircraftRegisterOptions',
        xmlStringify(convertAircraftRegisterOptionsListModelToEntity(aircraftRegisterOptionsDictionary), 'AircraftRegistersOptions'),
        'max'
      )
    );
  })
);
