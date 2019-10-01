import { XmlArray, xmlArray, xmlEscape, XmlBoolean, booleanToXml, xmlToBoolean } from 'src/utils/xml';
import AircraftSelectionEntity, { convertAircraftSelectionModelToEntity, convertAircraftSelectionEntityToModel } from 'src/entities/AircraftSelectionEntity';
import DayFlightRequirementLegEntity, { convertDayFlightRequirementLegModelToEntity, convertDayFlightRequirementLegEntityToModel } from './DayFlightRequirementLegEntity';
import DayFlightRequirementModel from '@core/models/flight-requirement/DayFlightRequirementModel';
import Id from '@core/types/Id';
import Rsx from '@core/types/Rsx';

export default interface DayFlightRequirementEntity {
  readonly _attributes: {
    readonly Rsx: Rsx;
    readonly Required: XmlBoolean;
    readonly Freezed: XmlBoolean;
    readonly Day: string;
    readonly Notes: string;
    readonly Id_AircraftRegister?: Id;
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
      Required: booleanToXml(data.required),
      Freezed: booleanToXml(data.freezed),
      Day: String(data.day),
      Notes: xmlEscape(data.notes),
      Id_AircraftRegister: data.aircraftRegisterId
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
    required: xmlToBoolean(data._attributes.Required),
    freezed: xmlToBoolean(data._attributes.Freezed),
    day: Number(data._attributes.Day),
    notes: data._attributes.Notes,
    aircraftRegisterId: data._attributes.Id_AircraftRegister,
    route: xmlArray(data.Route.DayFlightRequirementLeg).map(convertDayFlightRequirementLegEntityToModel)
  };
}
