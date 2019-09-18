import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Checker from 'src/business/constraints/Checker';
import PreplanAircraftRegister from 'src/business/PreplanAircraftRegister';

export default class AircraftRegisterObjection extends Objection {
  constructor(
    type: ObjectionType,
    priority: number,
    checker: Checker,
    readonly aircraftRegister: PreplanAircraftRegister,
    messageProvider: (constraintMarker: string, aircraftRegisterMarker: string) => string
  ) {
    super(type, 'AIRCRAFT_REGISTER', priority, checker, constraintMarker =>
      messageProvider(constraintMarker, `aircraft register ${aircraftRegister.name} of type ${aircraftRegister.aircraftType.name}`)
    );
  }

  get targetId(): string {
    return this.aircraftRegister.id;
  }
}
