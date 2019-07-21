import ConstraintTemplate from 'src/view-models/constraints/ConstraintTemplate';
import { SeasonType } from '@core/master-data';

export default abstract class Constraint {
  readonly template: ConstraintTemplate;
  readonly name: string;
  readonly description: string;
  readonly details: string;
  readonly fromDate?: Date;
  readonly toDate?: Date;
  readonly seasonType?: SeasonType;
  readonly days: readonly boolean[];

  protected constructor(
    template: ConstraintTemplate,
    name: string,
    description: string,
    details?: string,
    fromDate?: Date,
    toDate?: Date,
    seasonType?: SeasonType,
    ...days: readonly boolean[]
  ) {
    this.template = template;
    this.name = name;
    this.description = description;
    this.details = details || '';
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.seasonType = seasonType;
    this.days = Array.range(0, 6).map(d => days[d] !== false);
  }
}
