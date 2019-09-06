import Constraint from 'src/business/constraints/Constraint';

export type ObjectionType = 'ERROR' | 'WARNING';

export default abstract class Objection {
  readonly type: ObjectionType;
  readonly message: string;
  readonly priority: number;
  readonly constraint: Constraint;

  protected constructor(type: ObjectionType, priority: number, constraint: Constraint, messageProvider: (constraintMarker: string) => string) {
    this.type = type;
    const message = messageProvider(`constraint ${constraint.name}`);
    this.message = message[0].toUpperCase() + message.slice(1);
    this.priority = priority + (type === 'ERROR' ? 20000 : type === 'WARNING' ? 10000 : 0);
    this.constraint = constraint;
  }
}
