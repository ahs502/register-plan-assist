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

  readonly current: {
    readonly id: Id;

    readonly lastEditDateTime: Date;

    readonly simulation?: {
      readonly id: Id;
      readonly name: string;
    };
  };

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
    this.current = {
      id: raw.current.id,
      lastEditDateTime: dataTypes.utcDate.convertModelToBusiness(raw.current.lastEditDateTime),
      simulation: raw.current.simulation && {
        id: raw.current.simulation.id,
        name: dataTypes.name.convertModelToBusiness(raw.current.simulation.name)
      }
    };
  }
}
