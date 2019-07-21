import { default as MasterDataConstraint, AirportAllocationPriorityForAircraftsConstraintData } from '@core/master-data/Constraint';
import Constraint from './Constraint';
import ConstraintTemplate from 'src/view-models/constraints/ConstraintTemplate';
import { Airport, AircraftRegister } from '@core/master-data';

export default class AirportAllocationPriorityForAircraftsConstraint extends Constraint implements AirportAllocationPriorityForAircraftsConstraintData {
  readonly aircraftRegisters: readonly AircraftRegister[];
  readonly airports: readonly Airport[];

  constructor(masterDataConstraint: MasterDataConstraint) {
    super(
      ConstraintTemplate.all.AIRPORT_ALLOCATION_PRIORITY_FOR_AIRCRAFTS,
      masterDataConstraint.name,
      masterDataConstraint.description,
      masterDataConstraint.details,
      masterDataConstraint.fromDate,
      masterDataConstraint.toDate,
      masterDataConstraint.seasonType,
      ...masterDataConstraint.days
    );
    const data = masterDataConstraint.data as AirportAllocationPriorityForAircraftsConstraintData;
    this.aircraftRegisters = data.aircraftRegisters;
    this.airports = data.airports;
  }
}
