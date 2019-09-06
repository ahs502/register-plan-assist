import { default as MasterDataConstraint, AirportRestrictionOnAircraftsConstraintData } from '@core/master-data/Constraint';
import Constraint from './Constraint';
import ConstraintTemplate from 'src/business/constraints/ConstraintTemplate';
import { Airport, AircraftRegister } from '@core/master-data';

export default class AirportRestrictionOnAircraftsConstraint extends Constraint implements AirportRestrictionOnAircraftsConstraintData {
  readonly aircraftRegister: AircraftRegister;
  readonly airport: Airport;

  constructor(masterDataConstraint: MasterDataConstraint) {
    super(
      ConstraintTemplate.all.AIRPORT_RESTRICTION_ON_AIRCRAFTS,
      masterDataConstraint.name,
      masterDataConstraint.description,
      masterDataConstraint.details,
      masterDataConstraint.fromDate,
      masterDataConstraint.toDate,
      masterDataConstraint.seasonType,
      ...masterDataConstraint.days
    );
    const data = masterDataConstraint.data as AirportRestrictionOnAircraftsConstraintData;
    this.aircraftRegister = data.aircraftRegister;
    this.airport = data.airport;
  }
}
