import { Router } from 'express';
import { requestMiddlewareWithDb } from 'src/utils/requestMiddleware';

import Id from '@core/types/Id';
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import ConstraintTemplateDataFieldType from '@core/types/ConstraintTemplateDataFieldType';
import { xmlParse, xmlArray } from 'src/utils/xml';
import { Db } from 'src/utils/sqlServer';

import MasterData from 'src/utils/masterData';
import MasterDataModel from '@core/models/master-data/MasterDataModel';

import AircraftTypeModel from '@core/models/master-data/AircraftTypeModel';
import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';
import AirportModel from '@core/models/master-data/AirportModel';
import SeasonTypeModel from '@core/models/master-data/SeasonTypeModel';
import SeasonModel from '@core/models/master-data/SeasonModel';
import StcModel from '@core/models/master-data/StcModel';
import AircraftRegisterGroupModel from '@core/models/master-data/AircraftRegisterGroupModel';
import ConstraintTemplateModel from '@core/models/master-data/ConstraintTemplateModel';
import ConstraintModel from '@core/models/master-data/ConstraintModel';

const router = Router();
export default router;

router.post(
  '/get',
  requestMiddlewareWithDb<{ collections: (keyof MasterDataModel)[] }, MasterDataModel>(async (userId, { collections }, db) => {
    //TODO: Check user access here...

    return fetchAndCacheMasterData(collections, db);
  })
);

export async function fetchAndCacheMasterData(collections: (keyof MasterDataModel)[], db: Db): Promise<MasterDataModel> {
  const masterDataModel: MasterDataModel = {
    aircraftTypes: collections.includes('aircraftTypes') ? await getAircraftTypes() : undefined,
    aircraftRegisters: collections.includes('aircraftRegisters') ? await getAircraftRegisters() : undefined,
    airports: collections.includes('airports') ? await getAirports() : undefined,
    seasonTypes: collections.includes('seasonTypes') ? await getSeasonTypes() : undefined,
    seasons: collections.includes('seasons') ? await getSeasons() : undefined,
    stcs: collections.includes('seasons') ? await getStcs() : undefined,
    aircraftRegisterGroups: collections.includes('aircraftRegisterGroups') ? await getAircraftRegisterGroups() : undefined,
    constraintTemplates: collections.includes('constraintTemplates') ? await getConstraintTemplates() : undefined,
    constraints: collections.includes('constraints') ? await getConstraints() : undefined
  };

  MasterData.recieve(masterDataModel);

  return masterDataModel;

  interface MasterDataItemEntity {
    readonly id: Id;
    readonly name: string;
  }

  async function getAircraftTypes(): Promise<readonly AircraftTypeModel[]> {
    interface AircraftTypeEntity extends MasterDataItemEntity {
      readonly displayName: string;
      readonly turnroundStartDate: string;
      readonly turnroundEndDate: string;
      readonly turnroundDepartureDomestic: number;
      readonly turnroundDepartureInternational: number;
      readonly turnroundTransitDomestic: number;
      readonly turnroundTransitInternational: number;
    }

    const aircraftTypeEntities = await db
      .query<AircraftTypeEntity>(
        `
          select
            convert(varchar(30), u.[Id])           as [id],
            u.[ShortTitle]                         as [name],
            u.[DisplayOrder]                       as [displayName],
            t.[StartDate]                          as [turnroundStartDate],
            t.[EndDate]                            as [turnroundEndDate] ,
            t.[Domestic]                           as [turnroundDepartureDomestic],
            t.[International]                      as [turnroundDepartureInternational],
            t.[TransitDomestic]                    as [turnroundTransitDomestic] ,
            t.[TransitInternational]               as [turnroundTransitInternational]
          from
            [MasterData].[AircraftType]      as u
            left join 
              [MasterData].[Turnround]       as t
              on 
                u.[id] = t.[Id_AircraftType]
        `
      )
      .all();

    return Object.values(aircraftTypeEntities.groupBy('id')).map(group => {
      const sample = group[0];
      return {
        id: sample.id,
        name: sample.name,
        displayOrder: JSON.parse(sample.displayName),
        turnrounds: group.map(t => {
          return {
            startDate: new Date(t.turnroundStartDate).toJSON(),
            endDate: new Date(t.turnroundEndDate).toJSON(),
            minimumGroundTime: {
              departureDomestic: t.turnroundDepartureDomestic,
              departureInternational: t.turnroundDepartureInternational,
              transitDomestic: t.turnroundTransitDomestic,
              transitInternational: t.turnroundTransitInternational
            }
          };
        })
      };
    });
  }

  async function getAircraftRegisters(): Promise<readonly AircraftRegisterModel[]> {
    interface AircraftRegisterEntity extends MasterDataItemEntity {
      readonly aircraftTypeId: Id;
      readonly periodStartDate: string;
      readonly periodEndDate: string;
    }

    const aircraftRegisterEntities = await db
      .query<AircraftRegisterEntity>(
        `
          select
            convert(varchar(30), u.[Id])                    as [id],
            u.[ShortCode]                                   as [name],
            convert(varchar(30), u.[Id_AircraftType])       as [aircraftTypeId],
            p.[PeriodStartDate]                             as [periodStartDate],
            p.[PeriodEndDate]                               as [periodEndDate]
          from
            [MasterData].[AircraftRegister]                    as u
            join
              [MasterData].[AircraftRegisterValidPeriod]       as p
              on
                p.[Id_AircraftRegister] = u.[Id]
        `
      )
      .all();

    return Object.values(aircraftRegisterEntities.groupBy('id')).map(group => {
      const sample = group[0];
      return {
        id: sample.id,
        name: sample.name,
        aircraftTypeId: sample.aircraftTypeId,
        validPeriods: group.sortBy('periodStartDate').reduce<AircraftRegisterModel['validPeriods'][number][]>((result, r) => {
          const lastValidPeriod = result[result.length - 1];
          if (lastValidPeriod && new Date(lastValidPeriod.endDate).getDatePart().addDays(1) === new Date(r.periodStartDate).getDatePart()) {
            (lastValidPeriod as any).endDate = r.periodEndDate;
          } else {
            result.push({
              startDate: new Date(r.periodStartDate).toJSON(),
              endDate: new Date(r.periodEndDate).toJSON()
            });
          }
          return result;
        }, [])
      };
    });
  }

  async function getAirports(): Promise<readonly AirportModel[]> {
    interface AirportEntity extends MasterDataItemEntity {
      readonly fullName: string;
      readonly international: boolean;
      readonly offsetIsDst: boolean;
      readonly offsetStartDateTimeUtc: string;
      readonly offsetEndDateTimeUtc: string;
      readonly offsetStartDateTimeLocal: string;
      readonly offsetEndDateTimeLocal: string;
      readonly offset: number;
    }

    const airportEntities = await db
      .query<AirportEntity>(
        `
          select
            convert(varchar(30), u.[Id])            as [id],
            u.[Iata]                                as [name],
            u.[Name]                                as [fullName],
            cast(iif(l.[Code] = 2, 1, 0) as bit)    as [international],
            c.[IsDst]                               as [offsetIsDst],
            c.[StartDateUtc]                        as [offsetStartDateTimeUtc],
            c.[EndDateUtc]                          as [offsetEndDateTimeUtc] ,
            c.[StartDateLocal]                      as [offsetStartDateTimeLocal],
            c.[EndDateLocal]                        as [offsetEndDateTimeLocal],
            c.[OffsetFromUtc]                       as [offset]
          from
            [MasterData].[Airport]                      as u
            left join 
              [MasterData].[CityUtcOffset]              as c
              on 
                u.[Id_City] = c.[Id_City]
            left join 
              [MasterData].[LocalityType]               as l
              on 
                u.[Id_LocalityType] = l.[Id]
        `
      )
      .all();

    return Object.values(airportEntities.groupBy('id')).map(group => {
      const sample = group[0];
      return {
        id: sample.id,
        name: sample.name,
        fullName: sample.fullName,
        international: sample.international,
        utcOffsets: group.map(t => {
          return {
            dst: t.offsetIsDst,
            startDateTimeUtc: new Date(t.offsetStartDateTimeUtc).toJSON(),
            startDateTimeLocal: new Date(t.offsetStartDateTimeLocal).toJSON(),
            endDateTimeLocal: new Date(t.offsetEndDateTimeLocal).toJSON(),
            endDateTimeUtc: new Date(t.offsetEndDateTimeUtc).toJSON(),
            offset: t.offset
          };
        })
      };
    });
  }

  async function getSeasonTypes(): Promise<readonly SeasonTypeModel[]> {
    interface SeasonTypeEntity extends MasterDataItemEntity {}

    const seasonTypeEntities = await db
      .query<SeasonTypeEntity>(
        `
          select
            convert(varchar(30), [Id])      as [id],
            [Title]                         as [name]
          from
            [MasterData].[SeasonType]
        `
      )
      .all();

    return seasonTypeEntities.map(s => ({
      id: s.id,
      name: s.name
    }));
  }

  async function getSeasons(): Promise<readonly SeasonModel[]> {
    interface SeasonEntity extends MasterDataItemEntity {
      readonly startDate: string;
      readonly endDate: string;
      readonly seasonTypeId: Id;
    }

    const seasonEntities = await db
      .query<SeasonEntity>(
        `
          select
            convert(varchar(30), [Id])                 as [id],
            [SeasonName]                               as [name],
            [FromDateUtc]                              as [startDate],
            [ToDateUtc]                                as [endDate],
            convert(varchar(30), [Id_SeasonType])      as [seasonTypeId] 
          from
            [MasterData].[Season]
        `
      )
      .all();

    return seasonEntities.map(c => ({
      id: c.id,
      name: c.name,
      startDate: new Date(c.startDate).toJSON(),
      endDate: new Date(c.endDate).toJSON(),
      seasonTypeId: c.endDate
    }));
  }

  async function getStcs(): Promise<readonly StcModel[]> {
    interface StcEntity extends MasterDataItemEntity {
      readonly description: string;
    }

    const stcEntities = await db
      .query<StcEntity>(
        `
          select
            convert(varchar(30), [Id])     as [id],
            [Code]                         as [name],
            [description]                  as [description] 
          from
            [MasterData].[Stc]
        `
      )
      .all();

    return stcEntities.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description
    }));
  }

  async function getAircraftRegisterGroups(): Promise<readonly AircraftRegisterGroupModel[]> {
    interface AircraftRegisterGroupEntity {
      readonly aircraftRegistersXml: string;
    }

    const aircraftRegisterGroupEntities = await db
      .query<AircraftRegisterGroupEntity>(
        `
          select
            convert(varchar(30), [Id])     as [id],
            [Name]                         as [name],
            [AircraftRegisters]            as [aircraftRegistersXml]
          from
            [MasterData].[AircraftRegisterGroup]
        `
      )
      .all();

    return aircraftRegisterGroupEntities.map(g => ({
      id: g.id,
      name: g.name,
      aircraftRegisterIds: xmlArray(xmlParse(g.aircraftRegistersXml, 'AircraftRegisters')['AircraftRegister']).map(a => a._attributes.Id)
    }));
  }

  async function getConstraintTemplates(): Promise<readonly ConstraintTemplateModel[]> {
    interface ConstraintTemplateEntity extends MasterDataItemEntity {
      readonly type: ConstraintTemplateType;
      readonly instantiable: boolean;
      readonly description: string;
      readonly dataFieldsXml: string;
    }

    const constraintTemplateEntities = await db
      .query<ConstraintTemplateEntity>(
        `
          select
            convert(varchar(30), [Id])     as [id],
            [Name]                         as [name],
            [Code]                         as [type],
            [IsInstantiable]               as [instantiable],
            [Description]                  as [description],
            [DataFields]                   as [dataFieldsXml]
          from
            [MasterData].[ConstraintTemplate]
        `
      )
      .all();

    return constraintTemplateEntities.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      instantiable: t.instantiable,
      description: t.description,
      dataFields: xmlArray(xmlParse(t.dataFieldsXml, 'DataFields')['DataField']).map(d => ({
        type: d._attributes.Type,
        description: d._attributes.Description,
        title: d._attributes.Title,
        selectOptions: d.SelectOptions
          ? xmlArray(d.SelectOptions.SelectOption).map(o => ({
              title: o._attributes.Title,
              value: o._attributes.Value
            }))
          : undefined,
        selectRadio: d.SelectRadio ? d.SelectRadio._attributes.Value === 'true' : undefined
      }))
    }));
  }

  async function getConstraints(): Promise<readonly ConstraintModel[]> {
    interface ConstraintEntity extends MasterDataItemEntity {
      readonly type: ConstraintTemplateType;
      readonly details: string;
      readonly fromDate?: string;
      readonly toDate?: string;
      readonly seasonTypeId?: Id;
      readonly daysXml: string;
      readonly dataXml: string;
    }

    const constraintEntities = await db
      .query<ConstraintEntity>(
        `
          select
            convert(varchar(30), [Id])               as [id],
            [Name]                                   as [name],
            [Type]                                   as [type],
            [Details]                                as [details],
            [FromDate]                               as [fromDate],
            [ToDate]                                 as [toDate],
            convert(varchar(30), [SeasonTypeId])     as [seasonTypeId],
            [Days]                                   as [daysXml],
            [Data]                                   as [dataXml]
          from
            [MasterData].[Constraint]
        `
      )
      .all();

    return constraintEntities.map(c => {
      const dataKeys =
        c.type === 'AIRCRAFT_RESTRICTION_ON_AIRPORTS'
          ? ['airportIds', 'restriction', 'aircraftSelection']
          : c.type === 'AIRPORT_RESTRICTION_ON_AIRCRAFTS'
          ? ['aircraftRegisterId', 'airportIds']
          : c.type === 'BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS'
          ? ['maximumBlockTime', 'aircraftSelection']
          : c.type === 'ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS'
          ? ['airportId', 'nextAirportId']
          : c.type === 'AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS'
          ? ['aircraftRegisterIds', 'airportIds']
          : [];

      const dataValues = xmlArray(xmlParse(c.dataXml, 'Data')['Property']).map<any>(p => {
        switch (p._attributes.Type as ConstraintTemplateDataFieldType) {
          case 'CHECK_BOX':
            return p._text === 'true';

          case 'SELECT':
            return p._text;

          case 'TIME_SPAN':
            return Number(p._text);

          case 'AIRPORT':
            return p.Airport._attributes.Id;

          case 'AIRPORT_LIST':
            return xmlArray(p.Airports.Airport).map(a => a._attributes.Id);

          case 'AIRCRAFT_REGISTER':
            return p.AircraftRegister._attributes.Id;

          case 'AIRCRAFT_REGISTER_LIST':
            return xmlArray(p.AircraftRegisters.AircraftRegister).map(r => r._attributes.Id);

          case 'AIRCRAFT_SELECTION':
            return {
              allowedIdentities: xmlArray(p.AircraftSelection.AllowedIdentities.Identity).map(i => ({
                type: i._attributes.Type,
                entityId: i._attributes.Id_Entity
              })),
              forbiddenIdentities: xmlArray(p.AircraftSelection.ForbiddenIdentities.Identity).map(i => ({
                type: i._attributes.Type,
                entityId: i._attributes.Id_Entity
              }))
            };

          default:
            throw 'Not supported constraint template data field type.';
        }
      });

      return {
        id: c.id,
        name: c.name,
        type: c.type,
        details: c.details,
        scope: {
          fromDate: c.fromDate && new Date(c.fromDate).toJSON(),
          toDate: c.toDate && new Date(c.toDate).toJSON(),
          seasonTypeId: c.seasonTypeId,
          days: xmlArray(xmlParse(c.daysXml, 'Days')['Day']).reduce(
            (days, d) => ((days[d._attributes.Index] = true), days),
            Array.range(0, 6).map(() => false)
          )
        },
        data: dataKeys.reduce<any>((data, k) => ((data[k] = dataValues.shift()), data), {})
      };
    });
  }
}
