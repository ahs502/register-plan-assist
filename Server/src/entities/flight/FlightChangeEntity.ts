import Id from '@core/types/Id';
import { XmlArray, xmlArray } from 'src/utils/xml';
import FlightLegChangeEntity, { convertFlightLegChangeModelToEntity, convertFlightLegChangeEntityToModel } from 'src/entities/flight/FlightLegChangeEntity';
import FlightChangeModel from '@core/models/flight/FlightChangeModel';

export default interface FlightChangeEntity {
  readonly _attributes: {
    readonly startDate: string;
    readonly endDate: string;
    readonly Id_AircraftRegister: Id;
  };
  readonly Legs: {
    readonly Leg: XmlArray<FlightLegChangeEntity>;
  };
}

export function convertFlightChangeModelToEntity(data: FlightChangeModel): FlightChangeEntity {
  return {
    _attributes: {
      startDate: new Date(data.startDate).toJSON(),
      endDate: new Date(data.endDate).toJSON(),
      Id_AircraftRegister: data.aircraftRegisterId
    },
    Legs: {
      Leg: data.legs.map(convertFlightLegChangeModelToEntity)
    }
  };
}

export function convertFlightChangeEntityToModel(data: FlightChangeEntity): FlightChangeModel {
  return {
    startDate: new Date(data._attributes.startDate).toJSON(),
    endDate: new Date(data._attributes.endDate).toJSON(),
    aircraftRegisterId: data._attributes.Id_AircraftRegister,
    legs: xmlArray(data.Legs.Leg).map(convertFlightLegChangeEntityToModel)
  };
}
