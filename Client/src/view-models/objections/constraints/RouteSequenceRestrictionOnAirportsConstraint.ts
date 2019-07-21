import { default as MasterDataConstraint, RouteSequenceRestrictionOnAirportsConstraintData } from '@core/master-data/Constraint';
import Constraint from './Constraint';
import ConstraintTemplate from 'src/view-models/objections/ConstraintTemplate';
import { Airport } from '@core/master-data';

export default class RouteSequenceRestrictionOnAirportsConstraint extends Constraint implements RouteSequenceRestrictionOnAirportsConstraintData {
  readonly airport: Airport;
  readonly nextAirport: Airport;

  constructor(masterDataConstraint: MasterDataConstraint) {
    super(
      ConstraintTemplate.all.ROUTE_SEQUENCE_RESTRICTION_ON_AIRPORTS,
      masterDataConstraint.name,
      masterDataConstraint.description,
      masterDataConstraint.details,
      masterDataConstraint.fromDate,
      masterDataConstraint.toDate,
      masterDataConstraint.seasonType,
      ...masterDataConstraint.days
    );
    const data = masterDataConstraint.data as RouteSequenceRestrictionOnAirportsConstraintData;
    this.airport = data.airport;
    this.nextAirport = data.nextAirport;
  }
}
