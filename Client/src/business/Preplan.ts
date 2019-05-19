import AutoArrangerOptions from './AutoArrangerOptions';

export default interface Preplan {
  id: string;

  name: string;
  public: boolean;
  finalized: boolean;

  userId: string;
  userName: string;
  userDisplayName: string;

  parentPreplanId?: string;
  parentPreplanName?: string;

  creationDateTime: Date;
  lastEditDateTime: Date;

  startDate: Date;
  endDate: Date;

  simulationId?: string;
  simulationTitle?: string;

  // autoArrangerOptions: AutoArrangerOptions;
}
