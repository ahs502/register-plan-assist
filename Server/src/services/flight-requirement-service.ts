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
import { convertFlightModelToEntity } from 'src/entities/flight/FlightEntity';
import PreplanModel from '@core/models/preplan/PreplanModel';
import { getPreplanModel } from 'src/services/preplan-service';
import MasterData from 'src/utils/masterData';

const router = Router();
export default router;

router.post(
  '/add',
  requestMiddlewareWithTransactionalDbAccess<{ preplanId: Id; newFlightRequirement: NewFlightRequirementModel; newFlights: readonly NewFlightModel[] }, PreplanModel>(
    async (userId, { preplanId, newFlightRequirement, newFlights }, { runQuery, runSp }) => {
      const rawOtherExistingLabels: { label: string }[] = await runQuery(`select [Label] as [label] from [Rpa].[FlightRequirement] where [Id_Preplan] = '${preplanId}'`);
      const otherExistingLabels = rawOtherExistingLabels.map(l => l.label);
      const rawPartialPreplanEntity: { dummyAircraftRegistersXml: Xml; startDate: string; endDate: string }[] = await runQuery(
        `select [DummyAircraftRegisters] as [dummyAircraftRegistersXml] from [Rpa].[Preplan] where [Id] = '${preplanId}'`
      );
      if (rawPartialPreplanEntity.length === 0) throw 'Preplan is not found.';
      const dummyAircraftRegisterIds: Id[] = parsePreplanDummyAircraftRegistersXml(rawPartialPreplanEntity[0].dummyAircraftRegistersXml).map(r => r.id);
      const preplanStartDate = new Date(rawPartialPreplanEntity[0].startDate);
      const preplanEndDate = new Date(rawPartialPreplanEntity[0].endDate);
      new NewFlightRequirementModelValidation(newFlightRequirement, MasterData.all.stcs, otherExistingLabels, dummyAircraftRegisterIds, preplanStartDate, preplanEndDate).throw(
        'Invalid API input.'
      );

      const rawAircraftRegisterOptionsXml: { aircraftRegisterOptionsXml: Xml }[] = await runQuery(
        `select [AircraftRegisterOptions] as [aircraftRegisterOptionsXml] from [Rpa].[Preplan] where [Id] = '${preplanId}'`
      );
      const aircraftRegisterOptions = parsePreplanAircraftRegisterOptionsXml(rawAircraftRegisterOptionsXml[0].aircraftRegisterOptionsXml);
      new NewFlightModelArrayValidation(newFlights, aircraftRegisterOptions).throw('Invalid API input.');

      const newFlightRequirementEntity = convertNewFlightRequirementModelToEntity(newFlightRequirement);
      const result: { id: string }[] = await runSp(
        '[Rpa].[SP_InsertFlightRequirement]',
        runSp.bigIntParam('userId', userId),
        runSp.intParam('preplanId', preplanId),
        runSp.nVarCharParam('label', newFlightRequirementEntity.label, 100),
        runSp.nVarCharParam('category', newFlightRequirementEntity.category, 100),
        runSp.intParam('stcId', newFlightRequirementEntity.stcId),
        runSp.xmlParam('aircraftSelectionXml', newFlightRequirementEntity.aircraftSelectionXml),
        runSp.varCharParam('rsx', newFlightRequirementEntity.rsx, 10),
        runSp.nVarCharParam('notes', newFlightRequirementEntity.notes, 1000),
        runSp.bitParam('ignored', newFlightRequirementEntity.ignored),
        runSp.xmlParam('routeXml', newFlightRequirementEntity.routeXml),
        runSp.xmlParam('daysXml', newFlightRequirementEntity.daysXml)
      );
      const flightRequirementId = result[0].id;

      const newFlightEntities = newFlights.map(convertNewFlightModelToEntity);
      await runSp(
        '[Rpa].[SP_InsertFlights]',
        runSp.bigIntParam('userId', userId),
        runSp.tableParam(
          'flights',
          [runSp.intColumn('flightRequirementId'), runSp.intColumn('day'), runSp.bigIntColumn('aircraftRegisterId'), runSp.xmlColumn('legsXml')],
          newFlightEntities.map(f => [flightRequirementId, f.day, f.aircraftRegisterId, f.legsXml])
        )
      );

      await runSp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', runSp.bigIntParam('userId', userId), runSp.intParam('id', preplanId));

      return await getPreplanModel(runSp, userId, preplanId);
    }
  )
);

router.post(
  '/remove',
  requestMiddlewareWithTransactionalDbAccess<{ preplanId: Id; id: Id }, PreplanModel>(async (userId, { id, preplanId }, { runQuery, runSp }) => {
    const result = await runQuery(`select * from [Rpa].[FlightRequirement] where [Id] = '${id}'`);
    if (result.length === 0) throw 'Flight requirement is not found.';

    await runSp('[Rpa].[SP_DeleteFlights]', runSp.bigIntParam('userId', userId), runSp.intParam('flightRequirementId', id));

    await runSp('[Rpa].[Sp_DeleteFlightRequirement]', runSp.bigIntParam('userId', userId), runSp.intParam('id', id));

    await runSp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', runSp.bigIntParam('userId', userId), runSp.intParam('id', preplanId));

    return await getPreplanModel(runSp, userId, preplanId);
  })
);

router.post(
  '/edit',
  requestMiddlewareWithTransactionalDbAccess<
    { preplanId: Id; flightRequirement: FlightRequirementModel; flights: readonly FlightModel[]; newFlights: readonly NewFlightModel[] },
    PreplanModel
  >(async (userId, { preplanId, flightRequirement, flights, newFlights }, { runQuery, runSp, types }) => {
    const rawFlightRequirementIds: { id: Id }[] = await runQuery(`select convert(varchar(30), [Id]) as [id] from [Rpa].[FlightRequirement] where [Id_Preplan] = '${preplanId}'`);
    const flightRequirementIds = rawFlightRequirementIds.map(item => item.id);
    const rawOtherExistingLabels: { label: string }[] = await runQuery(
      `select [Label] as [label] from [Rpa].[FlightRequirement] where [Id_Preplan] = '${preplanId}' and [Id] <> '${flightRequirement.id}'`
    );
    const otherExistingLabels = rawOtherExistingLabels.map(l => l.label);
    const rawDummyAircraftRegistersXml: { dummyAircraftRegistersXml: Xml }[] = await runQuery(
      `select [DummyAircraftRegisters] as [dummyAircraftRegistersXml] from [Rpa].[Preplan] where [Id] = '${preplanId}'`
    );
    if (rawDummyAircraftRegistersXml.length === 0) throw 'Preplan is not found.';
    const dummyAircraftRegisterIds: Id[] = parsePreplanDummyAircraftRegistersXml(rawDummyAircraftRegistersXml[0].dummyAircraftRegistersXml).map(r => r.id);
    new FlightRequirementModelValidation(flightRequirement, flightRequirementIds, otherExistingLabels, dummyAircraftRegisterIds).throw('Invalid API input.');

    const rawFlightIds: { id: Id }[] = await runQuery(
      `select convert(varchar(30), f.[Id]) as [id] from [Rpa].[Flight] as f join [Rpa].[FlightRequirement] as r on r.[Id] = f.[Id_FlightRequirement] where r.[Id_Preplan] = '${preplanId}'`
    );
    const flightIds = rawFlightIds.map(f => f.id);
    const rawAircraftRegisterOptionsXml: { aircraftRegisterOptionsXml: Xml }[] = await runQuery(
      `select [AircraftRegisterOptions] as [aircraftRegisterOptionsXml] from [Rpa].[Preplan] where [Id] = '${preplanId}'`
    );
    const aircraftRegisterOptions = parsePreplanAircraftRegisterOptionsXml(rawAircraftRegisterOptionsXml[0].aircraftRegisterOptionsXml);
    new FlightModelArrayValidation(flights, flightIds, flightRequirementIds, aircraftRegisterOptions).throw('Invalid API input.');

    new NewFlightModelArrayValidation(newFlights, aircraftRegisterOptions).throw('Invalid API input.');

    const allFlights = [...flights, ...newFlights];
    if (allFlights.map(f => f.day).distinct().length !== allFlights.length) throw 'Invalid API input.';

    const flightRequirementEntity = convertFlightRequirementModelToEntity(flightRequirement);
    await runSp(
      '[Rpa].[SP_UpdateFlightRequirement]',
      runSp.bigIntParam('userId', userId),
      runSp.intParam('id', flightRequirementEntity.id),
      //runSp.intParam('preplanId', preplanId),
      runSp.nVarCharParam('label', flightRequirementEntity.label, 100),
      runSp.nVarCharParam('category', flightRequirementEntity.category, 100),
      runSp.intParam('stcId', flightRequirementEntity.stcId),
      runSp.xmlParam('aircraftSelectionXml', flightRequirementEntity.aircraftSelectionXml),
      runSp.varCharParam('rsx', flightRequirementEntity.rsx, 10),
      runSp.nVarCharParam('notes', flightRequirementEntity.notes, 1000),
      runSp.bitParam('ignored', flightRequirementEntity.ignored),
      runSp.xmlParam('routeXml', flightRequirementEntity.routeXml),
      runSp.xmlParam('daysXml', flightRequirementEntity.daysXml)
    );

    const flightEntities = flights.map(convertFlightModelToEntity);
    const newFlightEntities = newFlights.map(convertNewFlightModelToEntity);
    await runSp(
      '[Rpa].[SP_UpdateFlights]',
      runSp.bigIntParam('userId', userId),
      runSp.intParam('flightRequirementId', flightRequirementEntity.id),
      runSp.tableParam(
        'flights',
        [runSp.intColumn('id'), runSp.intColumn('flightRequirementId'), runSp.intColumn('day'), runSp.bigIntColumn('aircraftRegisterId'), runSp.xmlColumn('legsXml')],
        [
          ...flightEntities.map(f => [f.id, f.flightRequirementId, f.day, f.aircraftRegisterId, f.legsXml]),
          ...newFlightEntities.map(f => ['', flightRequirementEntity.id, f.day, f.aircraftRegisterId, f.legsXml])
        ]
      )
    );

    await runSp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', runSp.bigIntParam('userId', userId), runSp.intParam('id', preplanId));

    return await getPreplanModel(runSp, userId, preplanId);
  })
);
