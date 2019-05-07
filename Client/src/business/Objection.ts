export default interface Objection {
  message: string;
  type: ObjectionType;
  priority: number;
}

export enum ObjectionType {
  Error,
  Warning
}

export class ErrorObjection implements Objection {
  message: string;
  type: ObjectionType;
  priority: number;

  constructor(message: string) {
    this.message = message || 'Error';
    this.type = ObjectionType.Error;
    this.priority = 200;
  }
}

export class WarningObjection implements Objection {
  message: string;
  type: ObjectionType;
  priority: number;

  constructor(message: string) {
    this.message = message;
    this.type = ObjectionType.Warning;
    this.priority = 100;
  }
}
