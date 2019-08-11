import Objection, { ObjectionType } from './Objection';
import Constraint from 'src/view-models/constraints/Constraint';
import PreplanAircraftRegister from 'src/view-models/PreplanAircraftRegister';

export default class AircraftRegisterObjection extends Objection {
  readonly aircraftRegister: PreplanAircraftRegister;

  constructor(
    type: ObjectionType,
    priority: number,
    constraint: Constraint,
    aircraftRegister: PreplanAircraftRegister,
    messageProvider: (constraintMarker: string, aircraftRegisterMarker: string) => string
  ) {
    super(type, priority + 100, constraint, constraintMarker =>
      messageProvider(constraintMarker, `aircraft register ${aircraftRegister.name} of type ${aircraftRegister.aircraftType.name}`)
    );
    this.aircraftRegister = aircraftRegister;
  }
}
