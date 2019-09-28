import Checker from './Checker';
import Objectionable from './Objectionable';

export type ObjectionType = 'ERROR' | 'WARNING';

// const ObjectionTargetPriority = <const>{ FLIGHT: 4000, FLIGHT_REQUIREMENT: 3000, WEEKDAY_FLIGHT_REQUIREMENT: 2000, AIRCRAFT_REGISTER: 1000 };

export default class Objection<T extends Objectionable = Objectionable> {
  readonly derivedId: string;
  readonly type: ObjectionType;
  readonly target: T;
  readonly targetId: string;
  readonly displayOrder: number;
  readonly priority: number;
  readonly checker: Checker;
  readonly message: string;

  constructor(type: ObjectionType, target: T, targetId: string, displayOrder: number, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string) {
    this.derivedId = `${type}-${(target as Object).constructor.name}-${targetId}-${checker.derivedId}`;
    this.type = type;
    this.target = target;
    this.targetId = targetId;
    this.displayOrder = displayOrder;
    this.priority = priority;
    this.checker = checker;
    const message = messageProvider(checker.constraint ? `constraint ${checker.constraint.name}` : `general constraint ${checker.constraintTemplate.name}`);
    this.message = message[0].toUpperCase() + message.slice(1);
  }

  static sort(objections: Objection[]): Objection[] {
    return objections.sort((a, b) => {
      if (a.type === 'ERROR' && b.type === 'WARNING') return +1;
      if (a.type === 'WARNING' && b.type === 'ERROR') return -1;
      if (a.displayOrder > b.displayOrder) return +1;
      if (a.displayOrder < b.displayOrder) return -1;
      if (a.priority > b.priority) return +1;
      if (a.priority < b.priority) return -1;
      if (a.message > b.message) return +1;
      if (a.message < b.message) return -1;
      return 0; // Or maybe we should throw an error here!
    });
  }
}
