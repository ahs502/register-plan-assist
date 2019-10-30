import { XmlArray, xmlArray, xmlEscape } from 'src/utils/xml';
import AircraftSelectionEntity, { convertAircraftSelectionModelToEntity, convertAircraftSelectionEntityToModel } from 'src/entities/AircraftSelectionEntity';
import DayFlightRequirementModel from '@core/models/flight-requirement/DayFlightRequirementModel';
import Rsx from '@core/types/Rsx';
import DayFlightRequirementLegEntity, {
  convertDayFlightRequirementLegModelToEntity,
  convertDayFlightRequirementLegEntityToModel
} from 'src/entities/flight-requirement/DayFlightRequirementLegEntity';

export default interface DayFlightRequirementEntity {
  readonly _attributes: {
    readonly Rsx: Rsx;
    readonly Day: string;
    readonly Notes: string;
  };
  readonly AircraftSelection: AircraftSelectionEntity;
  readonly Route: {
    readonly DayFlightRequirementLeg: XmlArray<DayFlightRequirementLegEntity>;
  };
}

export function convertDayFlightRequirementModelToEntity(data: DayFlightRequirementModel): DayFlightRequirementEntity {
  return {
    _attributes: {
      Rsx: data.rsx,
      Day: String(data.day),
      Notes: xmlEscape(data.notes)
    },
    AircraftSelection: convertAircraftSelectionModelToEntity(data.aircraftSelection),
    Route: {
      DayFlightRequirementLeg: data.route.map(convertDayFlightRequirementLegModelToEntity)
    }
  };
}

export function convertDayFlightRequirementEntityToModel(data: DayFlightRequirementEntity): DayFlightRequirementModel {
  return {
    aircraftSelection: convertAircraftSelectionEntityToModel(data.AircraftSelection),
    rsx: data._attributes.Rsx,
    day: Number(data._attributes.Day),
    notes: data._attributes.Notes,
    route: xmlArray(data.Route.DayFlightRequirementLeg).map(convertDayFlightRequirementLegEntityToModel)
  };
}
