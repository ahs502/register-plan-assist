import Id from '@core/types/Id';
import User from 'src/business/User';
import { dataTypes } from 'src/utils/DataType';
import PreplanHeaderDataModel from '@core/models/preplan/PreplanHeaderDataModel';

export default class PreplanHeader {
  readonly id: Id;

  readonly name: string;
  readonly published: boolean;
  readonly accepted: boolean;

  readonly user: User;

  readonly parentPreplanHeader?: {
    readonly id: Id;
    readonly name: string;
    readonly user: User;
  };

  readonly creationDateTime: Date;

  readonly startDate: Date;
  readonly endDate: Date;

  readonly versions: readonly {
    readonly id: Id;

    readonly current: boolean;
    readonly lastEditDateTime: Date;
    readonly description: string;

    readonly simulation?: {
      readonly id: Id;
      readonly name: string;
    };
  }[];
  readonly current: Omit<PreplanHeader['versions'][number], 'current' | 'description'>;

  constructor(raw: PreplanHeaderDataModel) {
    this.id = raw.id;
    this.name = dataTypes.name.convertModelToBusiness(raw.name);
    this.published = raw.published;
    this.accepted = raw.accepted;
    this.user = new User(raw.user);
    this.parentPreplanHeader = raw.parentPreplanHeader && {
      id: raw.parentPreplanHeader.id,
      name: dataTypes.name.convertModelToBusiness(raw.parentPreplanHeader.name),
      user: new User(raw.parentPreplanHeader.user)
    };
    this.creationDateTime = dataTypes.utcDate.convertModelToBusiness(raw.creationDateTime);
    this.startDate = dataTypes.utcDate.convertModelToBusiness(raw.startDate);
    this.endDate = dataTypes.utcDate.convertModelToBusiness(raw.endDate);
    this.versions = raw.versions.map<PreplanHeader['versions'][number]>(v => ({
      id: v.id,
      current: v.current,
      lastEditDateTime: dataTypes.utcDate.convertModelToBusiness(v.lastEditDateTime),
      description: dataTypes.name.convertModelToBusiness(v.description),
      simulation: v.simulation && {
        id: v.simulation.id,
        name: dataTypes.name.convertModelToBusiness(v.simulation.name)
      }
    }));
    this.current = this.versions.find(v => v.current)!;
  }
}
