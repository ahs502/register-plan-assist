import Id from '@core/types/Id';
import Objectionable from 'src/business/constraints/Objectionable';
import Checker from 'src/business/constraints/Checker';

export type ObjectionType = 'ERROR' | 'WARNING';

export default class Objection<T extends Objectionable = Objectionable> {
  readonly type: ObjectionType;
  readonly target: T;
  readonly targetId: Id;
  readonly displayOrder: number;
  readonly priority: number;
  readonly checker: Checker;
  readonly message: string;
  readonly derivedId: Id;

  constructor(type: ObjectionType, target: T, displayOrder: number, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string) {
    this.type = type;
    this.target = target;
    this.targetId = (this.target.id || this.target.derivedId)!;
    if (!this.targetId) throw 'Can not instantiate an objection from a target without id.';
    this.displayOrder = displayOrder;
    this.priority = priority;
    this.checker = checker;
    const message = messageProvider(checker.constraint ? `constraint ${checker.constraint.name}` : `general constraint ${checker.constraintTemplate.name}`);
    this.message = message[0].toUpperCase() + message.slice(1);
    this.derivedId = `${type}-${(target as Object).constructor.name}-${this.targetId}-${checker.derivedId}`;
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
      return 0; // Or maybe we should throw an exception here?!
    });
  }
}
