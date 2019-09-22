import Markerable from './Markerable';
import Objection, { ObjectionType } from './Objection';
import Checker from './Checker';

export type ObjectionStatus = 'NONE' | ObjectionType;

export default interface Objectionable extends Markerable {
  objections?: Objection[];
  readonly objectionStatus: ObjectionStatus;
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection;
}
