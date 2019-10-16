import Id from '@core/types/Id';
import Objection, { ObjectionType } from 'src/business/constraints/Objection';
import Markerable from 'src/business/constraints/Markerable';
import Checker from 'src/business/constraints/Checker';

export default interface Objectionable extends Markerable {
  id?: Id;
  derivedId?: Id;
  objectionStatusDependencies?: readonly Objectionable[];
  issueObjection(type: ObjectionType, priority: number, checker: Checker, messageProvider: (constraintMarker: string) => string): Objection;
}
