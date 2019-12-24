import { xmlArray, XmlArray, xmlEscape } from 'src/utils/xml';
import Rsx from '@core/types/Rsx';
import FlightRequirementChangeModel from '@core/models/flight-requirement/FlightRequirementChangeModel';
import AircraftSelectionEntity, { convertAircraftSelectionModelToEntity, convertAircraftSelectionEntityToModel } from 'src/entities/AircraftSelectionEntity';
import FlightRequirementLegChangeEntity, {
  convertFlightRequirementLegChangeModelToEntity,
  convertFlightRequirementLegChangeEntityToModel
} from 'src/entities/flight-requirement/FlightRequirementLegChangeEntity';
import DayFlightRequirementChangeEntity, {
  convertDayFlightRequirementChangeModelToEntity,
  convertDayFlightRequirementChangeEntityToModel
} from 'src/entities/flight-requirement/DayFlightRequirementChangeEntity';

export default interface FlightRequirementChangeEntity {
  readonly _attributes: {
    readonly StartDate: string;
    readonly EndDate: string;
    readonly Rsx: Rsx;
    readonly Notes: string;
  };
  readonly AircraftSelection: AircraftSelectionEntity;
  readonly Route: {
    readonly FlightRequirementLeg: XmlArray<FlightRequirementLegChangeEntity>;
  };
  readonly Days: {
    readonly DayFlightRequirement: XmlArray<DayFlightRequirementChangeEntity>;
  };
}

export function convertFlightRequirementChangeModelToEntity(data: FlightRequirementChangeModel): FlightRequirementChangeEntity {
  return {
    _attributes: {
      StartDate: new Date(data.startDate).toJSON(),
      EndDate: new Date(data.endDate).toJSON(),
      Rsx: data.rsx,
      Notes: xmlEscape(data.notes)
    },
    AircraftSelection: convertAircraftSelectionModelToEntity(data.aircraftSelection),
    Route: {
      FlightRequirementLeg: data.route.map(convertFlightRequirementLegChangeModelToEntity)
    },
    Days: {
      DayFlightRequirement: data.days.map(convertDayFlightRequirementChangeModelToEntity)
    }
  };
}
export function convertFlightRequirementChangeEntityToModel(data: FlightRequirementChangeEntity): FlightRequirementChangeModel {
  return {
    startDate: new Date(data._attributes.StartDate).toJSON(),
    endDate: new Date(data._attributes.EndDate).toJSON(),
    aircraftSelection: convertAircraftSelectionEntityToModel(data.AircraftSelection),
    rsx: data._attributes.Rsx,
    notes: data._attributes.Notes,
    route: xmlArray(data.Route.FlightRequirementLeg).map(convertFlightRequirementLegChangeEntityToModel),
    days: xmlArray(data.Days.DayFlightRequirement).map(convertDayFlightRequirementChangeEntityToModel)
  };
}
