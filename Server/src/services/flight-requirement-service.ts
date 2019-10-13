import { Router } from 'express';
import { requestMiddlewareWithTransactionalDbAccess } from 'src/utils/requestMiddleware';
import { Xml } from 'src/utils/xml';
import Id from '@core/types/Id';
import { parsePreplanDummyAircraftRegistersXml, parsePreplanAircraftRegisterOptionsXml } from 'src/entities/preplan/PreplanEntity';
import { convertFlightRequirementModelToEntity } from 'src/entities/flight-requirement/FlightRequirementEntity';
import FlightRequirementModel, { FlightRequirementModelValidation } from '@core/models/flight-requirement/FlightRequirementModel';
import NewFlightRequirementModel, { NewFlightRequirementModelValidation } from '@core/models/flight-requirement/NewFlightRequirementModel';
import { convertNewFlightRequirementModelToEntity } from 'src/entities/flight-requirement/NewFlightRequirementEntity';
import NewFlightModel, { NewFlightModelArrayValidation } from '@core/models/flight/NewFlightModel';
import FlightModel, { FlightModelArrayValidation } from '@core/models/flight/FlightModel';
import { convertNewFlightModelToEntity } from 'src/entities/flight/NewFlightEntity';
import FlightEntity, { convertFlightModelToEntity, convertFlightEntityToModel } from 'src/entities/flight/FlightEntity';

const router = Router();
export default router;

router.post(
  '/add',
  requestMiddlewareWithTransactionalDbAccess<{ preplanId: Id; newFlightRequirement: NewFlightRequirementModel; newFlights: readonly NewFlightModel[] }, void>(
    async (userId, { preplanId, newFlightRequirement, newFlights }, { runQuery, runSp, types }) => {
      const rawDummyAircraftRegistersXml: { dummyAircraftRegistersXml: Xml }[] = await runQuery(
        `select [DummyAircraftRegisters] as [dummyAircraftRegistersXml] from [RPA].[Preplan] where [Id] = '${preplanId}'`
      );
      if (rawDummyAircraftRegistersXml.length === 0) throw 'Preplan is not found.';
      const dummyAircraftRegisterIds: Id[] = parsePreplanDummyAircraftRegistersXml(rawDummyAircraftRegistersXml[0].dummyAircraftRegistersXml).map(r => r.id);
      new NewFlightRequirementModelValidation(newFlightRequirement, dummyAircraftRegisterIds).throw('Invalid API input.');

      const rawAircraftRegisterOptionsXml: { aircraftRegisterOptionsXml: Xml }[] = await runQuery(
        `select [AircraftRegisterOptions] as [aircraftRegisterOptionsXml] from [RPA].[Preplan] where [Id] = '${preplanId}'`
      );
      const aircraftRegisterOptions = parsePreplanAircraftRegisterOptionsXml(rawAircraftRegisterOptionsXml[0].aircraftRegisterOptionsXml);
      new NewFlightModelArrayValidation(newFlights, aircraftRegisterOptions).throw('Invalid API input.');

      const newFlightRequirementEntity = convertNewFlightRequirementModelToEntity(newFlightRequirement);
      const result: Id[] = await runSp(
        '[RPA].[SP_InsertFlightRequirement]',
        runSp.varCharParam('userId', userId, 30),
        runSp.intParam('preplanId', preplanId),
        runSp.nVarCharParam('label', newFlightRequirementEntity.label, 100),
        runSp.nVarCharParam('category', newFlightRequirementEntity.category, 100),
        runSp.intParam('stcId', newFlightRequirementEntity.stcId),
        runSp.xmlParam('aircraftSelectionXml', newFlightRequirementEntity.aircraftSelectionXml),
        runSp.varCharParam('rsx', newFlightRequirementEntity.rsx, 10),
        runSp.bitParam('required', newFlightRequirementEntity.required),
        runSp.bitParam('ignored', newFlightRequirementEntity.ignored),
        runSp.xmlParam('routeXml', newFlightRequirementEntity.routeXml),
        runSp.xmlParam('daysXml', newFlightRequirementEntity.daysXml)
      );
      const flightRequirementId = result[0];

      const newFlightEntities = newFlights.map(convertNewFlightModelToEntity);
      await runSp(
        '[RPA].[SP_InsertFlights]',
        runSp.varCharParam('userId', userId, 30),
        runSp.tableParam(
          'flights',
          [
            { name: 'flightRequirementId', type: types.Int },
            { name: 'day', type: types.Int },
            { name: 'aircraftRegisterId', type: types.VarChar, length: 30 },
            { name: 'legsXml', type: types.Xml }
          ],
          newFlightEntities.map(f => [flightRequirementId, f.day, f.aircraftRegisterId, f.legsXml])
        )
      );

      await runSp('[RPA].[SP_UpdatePreplanLastEditDateTime]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', preplanId));
    }
  )
);

router.post(
  '/remove',
  requestMiddlewareWithTransactionalDbAccess<{ preplanId: Id; id: Id }, void>(async (userId, { id, preplanId }, { runQuery, runSp }) => {
    const result = await runQuery(`select * from [RPA].[FlightRequirement] where [Id] = '${id}'`);
    if (result.length === 0) throw 'Flight requirement is not found.';

    await runSp('[RPA].[SP_DeleteFlights]', runSp.varCharParam('userId', userId, 30), runSp.intParam('flightRequirementId', id));

    await runSp('[RPA].[Sp_DeleteFlightRequirement]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', id));

    await runSp('[RPA].[SP_UpdatePreplanLastEditDateTime]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', preplanId));
  })
);

router.post(
  '/edit',
  requestMiddlewareWithTransactionalDbAccess<
    { preplanId: Id; flightRequirement: FlightRequirementModel; flights: readonly FlightModel[]; newFlights: readonly NewFlightModel[] },
    FlightModel[]
  >(async (userId, { preplanId, flightRequirement, flights, newFlights }, { runQuery, runSp, types }) => {
    const rawFlightRequirementIds: { id: Id }[] = await runQuery(`select [Id] as [id] from [RPA].[FlightRequirement] where [Id_Preplan] = '${preplanId}'`);
    const flightRequirementIds = rawFlightRequirementIds.map(item => item.id);
    const rawDummyAircraftRegistersXml: { dummyAircraftRegistersXml: Xml }[] = await runQuery(
      `select [DummyAircraftRegisters] as [dummyAircraftRegistersXml] from [RPA].[Preplan] where [Id] = '${preplanId}'`
    );
    if (rawDummyAircraftRegistersXml.length === 0) throw 'Preplan is not found.';
    const dummyAircraftRegisterIds: Id[] = parsePreplanDummyAircraftRegistersXml(rawDummyAircraftRegistersXml[0].dummyAircraftRegistersXml).map(r => r.id);
    new FlightRequirementModelValidation(flightRequirement, flightRequirementIds, dummyAircraftRegisterIds).throw('Invalid API input.');

    const rawFlightIds: { id: Id }[] = await runQuery(`select f.[Id] as [id] from [RPA].[Flight] as f join [RPA].[FlightRequirement] as r where r.[Id_Preplan] = '${preplanId}'`);
    const flightIds = rawFlightIds.map(f => f.id);
    const rawAircraftRegisterOptionsXml: { aircraftRegisterOptionsXml: Xml }[] = await runQuery(
      `select [AircraftRegisterOptions] as [aircraftRegisterOptionsXml] from [RPA].[Preplan] where [Id] = '${preplanId}'`
    );
    const aircraftRegisterOptions = parsePreplanAircraftRegisterOptionsXml(rawAircraftRegisterOptionsXml[0].aircraftRegisterOptionsXml);
    new FlightModelArrayValidation(flights, flightIds, flightRequirementIds, aircraftRegisterOptions).throw('Invalid API input.');

    new NewFlightModelArrayValidation(newFlights, aircraftRegisterOptions).throw('Invalid API input.');

    const allFlights = [...flights, ...newFlights];
    if (allFlights.map(f => f.day).distinct().length !== allFlights.length) throw 'Invalid API input.';

    const flightRequirementEntity = convertFlightRequirementModelToEntity(flightRequirement);
    await runSp(
      '[RPA].[SP_UpdateFlightRequirement]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('id', flightRequirementEntity.id),
      runSp.intParam('preplanId', preplanId),
      runSp.nVarCharParam('label', flightRequirementEntity.label, 100),
      runSp.nVarCharParam('category', flightRequirementEntity.category, 100),
      runSp.intParam('stcId', flightRequirementEntity.stcId),
      runSp.xmlParam('aircraftSelectionXml', flightRequirementEntity.aircraftSelectionXml),
      runSp.varCharParam('rsx', flightRequirementEntity.rsx, 10),
      runSp.bitParam('required', flightRequirementEntity.required),
      runSp.bitParam('ignored', flightRequirementEntity.ignored),
      runSp.xmlParam('routeXml', flightRequirementEntity.routeXml),
      runSp.xmlParam('daysXml', flightRequirementEntity.daysXml)
    );

    const flightEntities = flights.map(convertFlightModelToEntity);
    const newFlightEntities = newFlights.map(convertNewFlightModelToEntity);
    await runSp(
      '[RPA].[SP_UpdateFlights]',
      runSp.varCharParam('userId', userId, 30),
      runSp.intParam('flightRequirementId', flightRequirementEntity.id),
      runSp.tableParam(
        'flights',
        [
          { name: 'id', type: types.Int },
          { name: 'flightRequirementId', type: types.Int },
          { name: 'day', type: types.Int },
          { name: 'aircraftRegisterId', type: types.Int },
          { name: 'legsXml', type: types.Xml }
        ],
        [
          ...flightEntities.map(f => [f.id, f.flightRequirementId, f.day, f.aircraftRegisterId, f.legsXml]),
          ...newFlightEntities.map(f => ['', flightRequirementEntity.id, f.day, f.aircraftRegisterId, f.legsXml])
        ]
      )
    );

    await runSp('[RPA].[SP_UpdatePreplanLastEditDateTime]', runSp.varCharParam('userId', userId, 30), runSp.intParam('id', preplanId));

    const allFlightEntities: FlightEntity[] = await runSp('[RPA].[Sp_GetFlights]', runSp.varCharParam('userId', userId, 30), runSp.intParam('preplanId', preplanId));
    const allFlightModels = allFlightEntities.map(convertFlightEntityToModel);
    return allFlightModels;
  })
);
