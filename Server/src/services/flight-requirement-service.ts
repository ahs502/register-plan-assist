import { Router } from 'express';
import { requestMiddlewareWithTransactionalDb } from 'src/utils/requestMiddleware';
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
import MasterData from 'src/utils/masterData';
import { getPreplanDataModel } from 'src/services/preplan-service';
import PreplanDataModel from '@core/models/preplan/PreplanDataModel';

const router = Router();
export default router;

router.post(
  '/add',
  requestMiddlewareWithTransactionalDb<{ preplanId: Id; newFlightRequirement: NewFlightRequirementModel; newFlights: readonly NewFlightModel[] }, PreplanDataModel>(
    async (userId, { preplanId, newFlightRequirement, newFlights }, db) => {
      const otherExistingLabels = await db
        .select<{ label: string }>({ label: '[Label]' })
        .from('[Rpa].[FlightRequirement]')
        .where(`[Id_Preplan] = '${preplanId}'`)
        .map(l => l.label);

      const { dummyAircraftRegisterIds, aircraftRegisterOptions, preplanStartDate, preplanEndDate } = await db
        .select<{ dummyAircraftRegistersXml: Xml; aircraftRegisterOptionsXml: Xml; startDate: string; endDate: string }>({
          dummyAircraftRegistersXml: 'p.[DummyAircraftRegisters]',
          aircraftRegisterOptionsXml: 'p.[AircraftRegisterOptions]',
          startDate: 'h.[StartDate]',
          endDate: 'h.[StartDate]'
        })
        .from('[Rpa].[Preplan] as p join [Rpa].[PreplanHeader] as h on h.[Id] = p.[Id_PreplanHeader]')
        .where(`p.[Id] = '${preplanId}'`)
        .pick(
          ({ dummyAircraftRegistersXml, aircraftRegisterOptionsXml, startDate, endDate }) => ({
            dummyAircraftRegisterIds: parsePreplanDummyAircraftRegistersXml(dummyAircraftRegistersXml).map(r => r.id),
            aircraftRegisterOptions: parsePreplanAircraftRegisterOptionsXml(aircraftRegisterOptionsXml),
            preplanStartDate: new Date(startDate),
            preplanEndDate: new Date(endDate)
          }),
          'Preplan is not found.'
        );

      new NewFlightRequirementModelValidation(
        newFlightRequirement,
        MasterData.all.stcs,
        MasterData.all.airports,
        otherExistingLabels,
        dummyAircraftRegisterIds,
        preplanStartDate,
        preplanEndDate
      ).throw('Invalid API input.');

      new NewFlightModelArrayValidation(newFlights, aircraftRegisterOptions, preplanStartDate, preplanEndDate).throw('Invalid API input.');

      const newFlightRequirementEntity = convertNewFlightRequirementModelToEntity(newFlightRequirement);
      const flightRequirementId = await db
        .sp<{ id: string }>(
          '[Rpa].[SP_InsertFlightRequirement]',
          db.bigIntParam('userId', userId),
          db.intParam('preplanId', preplanId),
          db.nVarCharParam('label', newFlightRequirementEntity.label, 100),
          db.nVarCharParam('category', newFlightRequirementEntity.category, 100),
          db.intParam('stcId', newFlightRequirementEntity.stcId),
          db.xmlParam('aircraftSelectionXml', newFlightRequirementEntity.aircraftSelectionXml),
          db.varCharParam('rsx', newFlightRequirementEntity.rsx, 10),
          db.nVarCharParam('notes', newFlightRequirementEntity.notes, 1000),
          db.bitParam('ignored', newFlightRequirementEntity.ignored),
          db.xmlParam('routeXml', newFlightRequirementEntity.routeXml),
          db.xmlParam('daysXml', newFlightRequirementEntity.daysXml),
          db.xmlParam('changesXml', newFlightRequirementEntity.changesXml)
        )
        .pick(({ id }) => id);

      const newFlightEntities = newFlights.map(convertNewFlightModelToEntity);
      await db
        .sp(
          '[Rpa].[SP_InsertFlights]',
          db.bigIntParam('userId', userId),
          db.tableParam(
            'flights',
            [db.intColumn('flightRequirementId'), db.intColumn('day'), db.bigIntColumn('aircraftRegisterId'), db.xmlColumn('legsXml')],
            newFlightEntities.map(f => [flightRequirementId, f.day, f.aircraftRegisterId, f.legsXml])
          )
        )
        .all();

      await db.sp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', db.bigIntParam('userId', userId), db.intParam('id', preplanId)).all();

      return await getPreplanDataModel(db, userId, preplanId);
    }
  )
);

router.post(
  '/remove',
  requestMiddlewareWithTransactionalDb<{ preplanId: Id; id: Id }, PreplanDataModel>(async (userId, { id, preplanId }, db) => {
    await db
      .select()
      .from('[Rpa].[FlightRequirement]')
      .where(`[Id] = '${id}'`)
      .one('Flight requirement is not found.');

    await db.sp('[Rpa].[Sp_DeleteFlightRequirement]', db.bigIntParam('userId', userId), db.intParam('id', id)).all();

    await db.sp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', db.bigIntParam('userId', userId), db.intParam('id', preplanId)).all();

    return await getPreplanDataModel(db, userId, preplanId);
  })
);

router.post(
  '/edit',
  requestMiddlewareWithTransactionalDb<
    { preplanId: Id; flightRequirement: FlightRequirementModel; flights: readonly FlightModel[]; newFlights: readonly NewFlightModel[] },
    PreplanDataModel
  >(async (userId, { preplanId, flightRequirement, flights, newFlights }, db) => {
    const flightRequirementIds = await db
      .select<{ id: Id }>({ id: 'convert(varchar(30), [Id])' })
      .from('[Rpa].[FlightRequirement]')
      .where(`[Id_Preplan] = '${preplanId}'`)
      .map(({ id }) => id, 'Flight requirement is not found.');
    const otherExistingLabels = await db
      .select<{ label: string }>({ label: '[Label]' })
      .from('[Rpa].[FlightRequirement]')
      .where(`[Id_Preplan] = '${preplanId}' and [Id] <> '${flightRequirement.id}'`)
      .map(({ label }) => label);
    const { dummyAircraftRegisterIds, aircraftRegisterOptions, preplanStartDate, preplanEndDate } = await db
      .select<{ dummyAircraftRegistersXml: Xml; aircraftRegisterOptionsXml: Xml; startDate: string; endDate: string }>({
        dummyAircraftRegistersXml: 'p.[DummyAircraftRegisters]',
        aircraftRegisterOptionsXml: 'p.[AircraftRegisterOptions]',
        startDate: 'h.[StartDate]',
        endDate: 'h.[EndDate]'
      })
      .from('[Rpa].[Preplan] as p join [Rpa].[PreplanHeader] as h on h.[Id] = p.[Id_PreplanHeader]')
      .where(`[Id] = '${preplanId}'`)
      .pick(
        ({ dummyAircraftRegistersXml, aircraftRegisterOptionsXml, startDate, endDate }) => ({
          dummyAircraftRegisterIds: parsePreplanDummyAircraftRegistersXml(dummyAircraftRegistersXml).map(({ id }) => id),
          aircraftRegisterOptions: parsePreplanAircraftRegisterOptionsXml(aircraftRegisterOptionsXml),
          preplanStartDate: new Date(startDate),
          preplanEndDate: new Date(endDate)
        }),
        'Preplan is not found.'
      );
    new FlightRequirementModelValidation(
      flightRequirement,
      MasterData.all.stcs,
      MasterData.all.airports,
      flightRequirementIds,
      otherExistingLabels,
      dummyAircraftRegisterIds,
      preplanStartDate,
      preplanEndDate
    ).throw('Invalid API input.');

    const flightIds = await db
      .select<{ id: Id }>({ id: 'convert(varchar(30), f.[Id])' })
      .from('[Rpa].[Flight] as f join [Rpa].[FlightRequirement] as r on r.[Id] = f.[Id_FlightRequirement]')
      .where(`r.[Id_Preplan] = '${preplanId}'`)
      .map(({ id }) => id);
    new FlightModelArrayValidation(flights, flightIds, flightRequirementIds, aircraftRegisterOptions, preplanStartDate, preplanEndDate).throw('Invalid API input.');

    new NewFlightModelArrayValidation(newFlights, aircraftRegisterOptions, preplanStartDate, preplanEndDate).throw('Invalid API input.');

    const allFlights = [...flights, ...newFlights];
    if (allFlights.map(({ day }) => day).distinct().length !== allFlights.length) throw 'Invalid API input.';

    const flightRequirementEntity = convertFlightRequirementModelToEntity(flightRequirement);
    await db
      .sp(
        '[Rpa].[SP_UpdateFlightRequirement]',
        db.bigIntParam('userId', userId),
        db.intParam('id', flightRequirementEntity.id),
        db.nVarCharParam('label', flightRequirementEntity.label, 100),
        db.nVarCharParam('category', flightRequirementEntity.category, 100),
        db.intParam('stcId', flightRequirementEntity.stcId),
        db.xmlParam('aircraftSelectionXml', flightRequirementEntity.aircraftSelectionXml),
        db.varCharParam('rsx', flightRequirementEntity.rsx, 10),
        db.nVarCharParam('notes', flightRequirementEntity.notes, 1000),
        db.bitParam('ignored', flightRequirementEntity.ignored),
        db.xmlParam('routeXml', flightRequirementEntity.routeXml),
        db.xmlParam('daysXml', flightRequirementEntity.daysXml),
        db.xmlParam('changesXml', flightRequirementEntity.changesXml)
      )
      .all();

    const flightEntities = flights.map(convertFlightModelToEntity);
    const newFlightEntities = newFlights.map(convertNewFlightModelToEntity);
    await db
      .sp(
        '[Rpa].[SP_UpdateFlights]',
        db.bigIntParam('userId', userId),
        db.intParam('flightRequirementId', flightRequirementEntity.id),
        db.tableParam(
          'flights',
          [
            db.intColumn('id'),
            db.intColumn('flightRequirementId'),
            db.intColumn('day'),
            db.bigIntColumn('aircraftRegisterId'),
            db.xmlColumn('legsXml'),
            db.xmlColumn('changesXml')
          ],
          [
            ...flightEntities.map(f => [f.id, f.flightRequirementId, f.day, f.aircraftRegisterId, f.legsXml, f.changesXml]),
            ...newFlightEntities.map(f => ['', flightRequirementEntity.id, f.day, f.aircraftRegisterId, f.legsXml, f.changesXml])
          ]
        )
      )
      .all();

    await db.sp('[Rpa].[SP_UpdatePreplanLastEditDateTime]', db.bigIntParam('userId', userId), db.intParam('id', preplanId)).all();

    return await getPreplanDataModel(db, userId, preplanId);
  })
);
