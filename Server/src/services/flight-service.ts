import { Router } from 'express';
import { requestMiddlewareWithTransactionalDb } from 'src/utils/requestMiddleware';
import { Xml } from 'src/utils/xml';
import Id from '@core/types/Id';
import { parsePreplanAircraftRegisterOptionsXml } from 'src/entities/preplan/PreplanEntity';
import FlightModel, { FlightModelArrayValidation } from '@core/models/flight/FlightModel';
import { convertFlightModelToEntity } from 'src/entities/flight/FlightEntity';
import { getPreplanDataModel } from 'src/services/preplan-service';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';

const router = Router();
export default router;

router.post(
  '/edit',
  requestMiddlewareWithTransactionalDb<{ preplanId: Id; flights: readonly FlightModel[] }, PreplanDataModel>(async (userId, { preplanId, flights }, db) => {
    const flightIds = await db
      .select<{ id: Id }>({ id: 'convert(varchar(30), f.[Id])' })
      .from('[Rpa].[Flight] as f join [Rpa].[FlightRequirement] as r on f.[Id_FlightRequirement] = r.[Id]')
      .where(`r.[Id_Preplan] = '${preplanId}'`)
      .map(({ id }) => id);
    const flightRequirementIds = await db
      .select<{ id: Id }>({ id: 'convert(varchar(30), [Id])' })
      .from('[Rpa].[FlightRequirement]')
      .where(`[Id_Preplan] = '${preplanId}'`)
      .map(({ id }) => id);
    const { aircraftRegisterOptions, preplanStartDate, preplanEndDate } = await db
      .select<{ aircraftRegisterOptionsXml: Xml; startDate: string; endDate: string }>({
        aircraftRegisterOptionsXml: 'p.[AircraftRegisterOptions]',
        startDate: 'h.[StartDate]',
        endDate: 'h.[EndDate]'
      })
      .from('[Rpa].[Preplan] as p join [Rpa].[PreplanHeader] as h on h.[Id] = p.[Id_PreplanHeader]')
      .where(`p.[Id] = '${preplanId}'`)
      .pick(
        ({ aircraftRegisterOptionsXml, startDate, endDate }) => ({
          aircraftRegisterOptions: parsePreplanAircraftRegisterOptionsXml(aircraftRegisterOptionsXml),
          preplanStartDate: new Date(startDate),
          preplanEndDate: new Date(endDate)
        }),
        'Preplan is not found.'
      );
    new FlightModelArrayValidation(flights, flightIds, flightRequirementIds, aircraftRegisterOptions, preplanStartDate, preplanEndDate).throw('Invalid API input.');

    if (flights.length === 0) return;

    const flightEntities = flights.map(convertFlightModelToEntity);
    await db
      .sp(
        '[Rpa].[SP_UpdateFlights]',
        db.bigIntParam('userId', userId),
        db.intParam('flightRequirementId', flights[0].flightRequirementId),
        db.tableParam(
          'flights',
          [db.intColumn('id'), db.dateTimeColumn('date'), db.varCharColumn('aircraftRegisterId', 30), db.xmlColumn('legsXml')],
          flightEntities.map(f => [f.id, f.date, f.aircraftRegisterId, f.legsXml])
        )
      )
      .all();

    await db.sp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', db.bigIntParam('userId', userId), db.intParam('id', preplanId)).all();

    return await getPreplanDataModel(db, userId, preplanId);
  })
);
