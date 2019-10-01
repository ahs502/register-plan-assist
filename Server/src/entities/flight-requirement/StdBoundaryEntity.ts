import StdBoundaryModel from '@core/models/flight-requirement/StdBoundaryModel';

export default interface StdBoundaryEntity {
  readonly _attributes: {
    readonly StdLowerBound: string;
    readonly StdUpperBound?: string;
  };
}

export function convertStdBoundaryModelToEntity(data: StdBoundaryModel): StdBoundaryEntity {
  return {
    _attributes: {
      StdLowerBound: String(data.stdLowerBound),
      StdUpperBound: data.stdUpperBound === undefined ? undefined : String(data.stdUpperBound)
    }
  };
}
export function convertStdBoundaryEntityToModel(data: StdBoundaryEntity): StdBoundaryModel {
  return {
    stdLowerBound: Number(data._attributes.StdLowerBound),
    stdUpperBound: data._attributes.StdUpperBound === undefined ? undefined : Number(data._attributes.StdUpperBound)
  };
}
