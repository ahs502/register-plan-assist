import Id from '@core/types/Id';
import PreplanHeaderModel from '@core/models/preplan/PreplanHeaderModel';
import User from 'src/business/User';

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
    this.name = raw.name;
    this.published = raw.published;
    this.finalized = raw.finalized;
    this.user = new User(raw.user);
    this.parentPreplan = raw.parentPreplan && {
      id: raw.parentPreplan.id,
      name: raw.parentPreplan.name,
      user: new User(raw.parentPreplan.user)
    };
    this.creationDateTime = new Date(raw.creationDateTime);
    this.lastEditDateTime = new Date(raw.lastEditDateTime);
    this.startDate = new Date(raw.startDate);
    this.endDate = new Date(raw.endDate);
    this.simulation = raw.simulation && {
      id: raw.simulation.id,
      name: raw.simulation.name
    };
  }
}
