export type ObjectionType = 'ERROR' | 'WARNING';

export default abstract class Objection {
  readonly type: ObjectionType;
  readonly message: string;
  readonly priority: number;

  constructor(type: ObjectionType, message: string, priority: number) {
    this.type = type;
    this.message = message;
    this.priority = priority;
  }
}

export abstract class ErrorObjection extends Objection {
  constructor(message: string, priority: number = 200) {
    super('ERROR', message || '(Error)', priority);
  }
}

export abstract class WarningObjection extends Objection {
  constructor(message: string, priority: number = 100) {
    super('WARNING', message || '(Warning)', priority);
  }
}
