import Checker from './Checker';

export type ObjectionType = 'ERROR' | 'WARNING';
const ObjectionTypePriority = <const>{ ERROR: 20000, WARNING: 10000 };

export type ObjectionTarget = 'FLIGHT' | 'FLIGHT_REQUIREMENT' | 'WEEKDAY_FLIGHT_REQUIREMENT' | 'AIRCRAFT_REGISTER';
const ObjectionTargetPriority = <const>{ FLIGHT: 4000, FLIGHT_REQUIREMENT: 3000, WEEKDAY_FLIGHT_REQUIREMENT: 2000, AIRCRAFT_REGISTER: 1000 };

export default abstract class Objection {
  readonly type: ObjectionType;
  readonly target: ObjectionTarget;
  readonly priority: number;
  readonly checker: Checker;
  readonly message: string;

  protected constructor(type: ObjectionType, target: ObjectionTarget, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string) {
    this.type = type;
    this.target = target;
    this.priority = priority + ObjectionTypePriority[type] + ObjectionTargetPriority[target];
    this.checker = checker;
    const message = messageProvider(checker.constraint ? `constraint ${checker.constraint.name}` : `general constraint ${checker.constraintTemplate.name}`);
    this.message = message[0].toUpperCase() + message.slice(1);
  }

  abstract get targetId(): string;

  match(anotherObjection: Objection): boolean {
    return (
      this.type === anotherObjection.type &&
      this.target == anotherObjection.target &&
      this.checker.derivedId === anotherObjection.checker.derivedId &&
      this.targetId === anotherObjection.targetId
    );
  }
}
