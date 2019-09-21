import { Router } from 'express';
import { requestMiddlewareWithDbAccess } from 'src/utils/requestMiddleware';

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
import ConstraintTemplateType from '@core/types/ConstraintTemplateType';
import { xmlParse, xmlArray } from 'src/utils/xml';

const router = Router();
export default router;

router.post(
  '/get',
  requestMiddlewareWithDbAccess<{ collections: (keyof MasterDataModel)[] }, MasterDataModel>(async (userId, { collections }, { runQuery }) => {
    //TODO: Check user access here...
    //TODO: Implement aircraftGroups & constraints too.

    const MasterDataModel: MasterDataModel = {
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

    return MasterDataModel;

    async function getAircraftTypes(): Promise<readonly AircraftTypeModel[]> {
      const rawAircraftTypes: readonly {
        id: string;
        name: string;
        displayName: string;
        turnroundStartDate: string;
        turnroundEndDate: string;
        turnroundDepartureDomestic: number;
        turnroundDepartureInternational: number;
        turnroundTransitDomestic: number;
        turnroundTransitInternational: number;
      }[] = await runQuery(
        `
          select
            u.[Id]                        as [id],
            u.[ShortTitle]                as [name],
            u.[DisplayOrder]              as [displayName],
            t.[StartDate]                 as [turnroundStartDate],
            t.[EndDate]                   as [turnroundEndDate] ,
            t.[Domestic]                  as [turnroundDepartureDomestic],
            t.[International]             as [turnroundDepartureInternational],
            t.[TransitDomestic]           as [turnroundTransitDomestic] ,
            t.[TransitInternational]      as [turnroundTransitInternational]
          from
            [MasterData].[AircraftType]      as u
            left join 
              [MasterData].[Turnround]       as t
              on 
                u.[id] = t.[Id_AircraftType]
        `
      );

      return Object.values(rawAircraftTypes.groupBy('id')).map(group => {
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
      const rawAircraftRegisters: {
        id: string;
        name: string;
        aircraftTypeId: string;
        periodStartDate: string;
        periodEndDate: string;
      }[] = await runQuery(
        `
          select
            u.[Id]                              as [id],
            u.[ShortCode]                       as [name],
            u.[Id_AircraftType]                 as [aircraftTypeId],
            p.[PeriodStartDate]                 as [periodStartDate],
            p.[PeriodEndDate]                   as [periodEndDate]
          from
            [MasterData].[AircraftRegister]                as u
          join
            [MasterData].[AircraftRegisterValidPeriod]     as p
            on
              p.[Id_AircraftRegister] = u.[Id]
        `
      );

      return Object.values(rawAircraftRegisters.groupBy('id')).map(group => {
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
      const rawAirports: readonly {
        id: string;
        name: string;
        fullName: string;
        international: boolean;
        offsetIsDst: boolean;
        offsetStartDateTimeUtc: string;
        offsetEndDateTimeUtc: string;
        offsetStartDateTimeLocal: string;
        offsetEndDateTimeLocal: string;
        offset: number;
      }[] = await runQuery(
        `
          select
            u.[Id]                                  as [id],
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
      );

      return Object.values(rawAirports.groupBy('id')).map(group => {
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
      return await runQuery(
        `
          select
            [Id]                        as [id],
            [Title]                     as [name]
          from
            [MasterData].[SeasonType]
        `
      );
    }

    async function getSeasons(): Promise<readonly SeasonModel[]> {
      const rawSeasons: readonly {
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        seasonTypeId: string;
      }[] = await runQuery(
        `
          select
            [Id]                        as [id],
            [SeasonName]                as [name],
			      [FromDateUtc]               as [startDate],
			      [ToDateUtc]                 as [endDate],
			      [Id_SeasonType]             as [seasonTypeId] 
          from
            [MasterData].[Season]
        `
      );

      return rawSeasons.map(c => ({
        id: c.id,
        name: c.name,
        startDate: new Date(c.startDate).toJSON(),
        endDate: new Date(c.endDate).toJSON(),
        seasonTypeId: c.endDate
      }));
    }

    async function getStcs(): Promise<readonly StcModel[]> {
      return await runQuery(
        `
          select
            [Id]                        as [id],
            [Code]                      as [name],
			      [description]               as [description] 
          from
            [MasterData].[Stc]
        `
      );
    }

    async function getAircraftRegisterGroups(): Promise<readonly AircraftRegisterGroupModel[]> {
      return []; // Not implemented.
    }

    async function getConstraintTemplates(): Promise<readonly ConstraintTemplateModel[]> {
      const rawConstraintTemplates: readonly {
        id: string;
        name: string;
        type: ConstraintTemplateType;
        instantiable: boolean;
        description: string;
        dataFieldsXml: string;
      }[] = await runQuery(
        `
          select
            [Id]                     as [id],
            [Name]                   as [name],
            [Code]                   as [type],
            [IsInstantiable]         as [instantiable],
            [Description]            as [description],
            [DataFields]             as [dataFieldsXml]
          from
            [MasterData].[ConstraintTemplate]
        `
      );

      return rawConstraintTemplates.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        instantiable: t.instantiable,
        description: t.description,
        dataFields: xmlArray(xmlParse(t.dataFieldsXml, 'DataFields')['DataField']).map(d => ({
          name: d._attributes.Name,
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
      return []; // Not implemented.
    }
  })
);
