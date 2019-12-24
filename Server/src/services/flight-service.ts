import { Router } from 'express';
import { requestMiddlewareWithDbAccess } from 'src/utils/requestMiddleware';
import { Xml } from 'src/utils/xml';
import Id from '@core/types/Id';
import { parsePreplanAircraftRegisterOptionsXml } from 'src/entities/preplan/PreplanEntity';
import FlightModel, { FlightModelArrayValidation } from '@core/models/flight/FlightModel';
import { convertFlightModelToEntity } from 'src/entities/flight/FlightEntity';
import PreplanModel from '@core/models/preplan/PreplanModel';
import { getPreplanDataModel } from 'src/services/preplan-service';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';

const router = Router();
export default router;

router.post(
  '/edit',
  requestMiddlewareWithDbAccess<{ preplanId: Id; flights: readonly FlightModel[] }, PreplanDataModel>(async (userId, { preplanId, flights }, { runQuery, runSp }) => {
    const rawFlightIds: { id: Id }[] = await runQuery(
      `select convert(varchar(30), f.[Id]) as [id] from [Rpa].[Flight] as f join [Rpa].[FlightRequirement] as r on f.[Id_FlightRequirement] = r.[Id] where r.[Id_Preplan] = '${preplanId}'`
    );
    const flightIds = rawFlightIds.map(f => f.id);
    const rawFlightRequirementIds: { id: Id }[] = await runQuery(`select convert(varchar(30), [Id]) as [id] from [Rpa].[FlightRequirement] where [Id_Preplan] = '${preplanId}'`);
    const flightRequirementIds = rawFlightRequirementIds.map(item => item.id);
    const rawAircraftRegisterOptionsXml: { aircraftRegisterOptionsXml: Xml }[] = await runQuery(
      `select [AircraftRegisterOptions] as [aircraftRegisterOptionsXml] from [Rpa].[Preplan] where [Id] = '${preplanId}'`
    );
    const aircraftRegisterOptions = parsePreplanAircraftRegisterOptionsXml(rawAircraftRegisterOptionsXml[0].aircraftRegisterOptionsXml);
    new FlightModelArrayValidation(flights, flightIds, flightRequirementIds, aircraftRegisterOptions).throw('Invalid API input.');

    if (flights.length === 0) return;

    const flightEntities = flights.map(convertFlightModelToEntity);
    await runSp(
      '[Rpa].[SP_UpdateFlights]',
      runSp.bigIntParam('userId', userId),
      runSp.intParam('flightRequirementId', flights[0].flightRequirementId),
      runSp.tableParam(
        'flights',
        [runSp.intColumn('id'), runSp.intColumn('flightRequirementId'), runSp.intColumn('day'), runSp.bigIntColumn('aircraftRegisterId'), runSp.xmlColumn('legsXml')],
        flightEntities.map(f => [f.id, f.flightRequirementId, f.day, f.aircraftRegisterId, f.legsXml])
      )
    );

    return await getPreplanDataModel(runSp, userId, preplanId);
  })
);
