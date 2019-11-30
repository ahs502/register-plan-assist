import Id from '@core/types/Id';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import User from 'src/business/User';
import { dataTypes } from 'src/utils/DataType';

export default class PreplanHeader {
  readonly id: Id;

  readonly name: string;
  readonly published: boolean;
  readonly finalized: boolean;

  readonly user: User;

  readonly parentPreplan?: {
    readonly id: Id;
    readonly name: string;
    readonly user: User;
  };

  readonly creationDateTime: Date;
  readonly lastEditDateTime: Date;

  readonly startDate: Date;
  readonly endDate: Date;

  readonly simulation?: {
    readonly id: Id;
    readonly name: string;
  };

  constructor(raw: PreplanHeaderModel) {
    this.id = raw.id;
    this.name = dataTypes.name.convertModelToBusiness(raw.name);
    this.published = raw.published;
    this.finalized = raw.finalized;
    this.user = new User(raw.user);
    this.parentPreplan = raw.parentPreplan && {
      id: raw.parentPreplan.id,
      name: dataTypes.name.convertModelToBusiness(raw.parentPreplan.name),
      user: new User(raw.parentPreplan.user)
    };
    this.creationDateTime = dataTypes.utcDate.convertModelToBusiness(raw.creationDateTime);
    this.lastEditDateTime = dataTypes.utcDate.convertModelToBusiness(raw.lastEditDateTime);
    this.startDate = dataTypes.utcDate.convertModelToBusiness(raw.startDate);
    this.endDate = dataTypes.utcDate.convertModelToBusiness(raw.endDate);
    this.simulation = raw.simulation && {
      id: raw.simulation.id,
      name: dataTypes.name.convertModelToBusiness(raw.simulation.name)
    };
  }
}
