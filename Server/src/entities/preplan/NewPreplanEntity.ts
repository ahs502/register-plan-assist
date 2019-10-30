import NewPreplanModel from '@core/models/preplan/NewPreplanModel';

export default interface NewPreplanEntity {
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

export function convertNewPreplanModelToEntity(data: NewPreplanModel): NewPreplanEntity {
  return {
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate
  };
}
