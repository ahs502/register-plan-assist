import { XmlArray, xmlArray, xmlEscape } from 'src/utils/xml';
import AircraftSelectionEntity, { convertAircraftSelectionModelToEntity, convertAircraftSelectionEntityToModel } from 'src/entities/AircraftSelectionEntity';
import DayFlightRequirementChangeModel from '@core/models/flight-requirement/DayFlightRequirementChangeModel';
import Rsx from '@core/types/Rsx';
import DayFlightRequirementLegChangeEntity, {
  convertDayFlightRequirementLegChangeModelToEntity,
  convertDayFlightRequirementLegChangeEntityToModel
} from 'src/entities/flight-requirement/DayFlightRequirementLegChangeEntity';

export default interface DayFlightRequirementChangeEntity {
  readonly _attributes: {
    readonly Rsx: Rsx;
    readonly Day: string;
    readonly Notes: string;
  };
  readonly AircraftSelection: AircraftSelectionEntity;
  readonly Route: {
    readonly DayFlightRequirementLeg: XmlArray<DayFlightRequirementLegChangeEntity>;
  };
}

export function convertDayFlightRequirementChangeModelToEntity(data: DayFlightRequirementChangeModel): DayFlightRequirementChangeEntity {
  return {
    _attributes: {
      Rsx: data.rsx,
      Day: String(data.day),
      Notes: xmlEscape(data.notes)
    },
    AircraftSelection: convertAircraftSelectionModelToEntity(data.aircraftSelection),
    Route: {
      DayFlightRequirementLeg: data.route.map(convertDayFlightRequirementLegChangeModelToEntity)
    }
  };
}

export function convertDayFlightRequirementChangeEntityToModel(data: DayFlightRequirementChangeEntity): DayFlightRequirementChangeModel {
  return {
    aircraftSelection: convertAircraftSelectionEntityToModel(data.AircraftSelection),
    rsx: data._attributes.Rsx,
    day: Number(data._attributes.Day),
    notes: data._attributes.Notes,
    route: xmlArray(data.Route.DayFlightRequirementLeg).map(convertDayFlightRequirementLegChangeEntityToModel)
  };
}
