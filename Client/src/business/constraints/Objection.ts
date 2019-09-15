import Checker from './Checker';

export type ObjectionType = 'ERROR' | 'WARNING';

export default abstract class Objection {
  readonly type: ObjectionType;
  readonly priority: number;
  readonly checker: Checker;
  readonly message: string;

  protected constructor(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string) {
    this.type = type;
    this.priority = priority + (type === 'ERROR' ? 20000 : type === 'WARNING' ? 10000 : 0);
    this.checker = checker;
    const message = messageProvider(checker.constraint ? `constraint ${checker.constraint.name}` : `general constraint ${checker.constraintTemplate.name}`);
    this.message = message[0].toUpperCase() + message.slice(1);
  }
}
