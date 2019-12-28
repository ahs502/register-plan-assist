import NewPreplanHeaderModel from '@core/models/preplan/NewPreplanHeaderModel';

export default interface NewPreplanHeaderEntity {
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

export function convertNewPreplanHeaderModelToEntity(data: NewPreplanHeaderModel): NewPreplanHeaderEntity {
  return {
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate
  };
}
