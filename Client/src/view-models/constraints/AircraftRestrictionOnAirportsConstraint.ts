import { default as MasterDataConstraint, AircraftRestrictionOnAirportsConstraintData } from '@core/master-data/Constraint';
import Constraint from './Constraint';
import ConstraintTemplate from 'src/view-models/constraints/ConstraintTemplate';
import { Airport, AircraftSelection } from '@core/master-data';

export default class AircraftRestrictionOnAirportsConstraint extends Constraint implements AircraftRestrictionOnAirportsConstraintData {
  readonly airports: readonly Airport[];
  readonly never: boolean;
  readonly aircraftSelection: AircraftSelection;
  readonly required: boolean;

  constructor(masterDataConstraint: MasterDataConstraint) {
    super(
      ConstraintTemplate.all.AIRCRAFT_RESTRICTION_ON_AIRPORTS,
      masterDataConstraint.name,
      masterDataConstraint.description,
      masterDataConstraint.details,
      masterDataConstraint.fromDate,
      masterDataConstraint.toDate,
      masterDataConstraint.seasonType,
      ...masterDataConstraint.days
    );
    const data = masterDataConstraint.data as AircraftRestrictionOnAirportsConstraintData;
    this.airports = data.airports;
    this.never = data.never;
    this.aircraftSelection = data.aircraftSelection;
    this.required = data.required;
  }
}
