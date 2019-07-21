import { default as MasterDataConstraint, BlickTimeRestrictionOnAircraftsConstraintData } from '@core/master-data/Constraint';
import Constraint from './Constraint';
import ConstraintTemplate from 'src/view-models/constraints/ConstraintTemplate';
import { AircraftSelection } from '@core/master-data';

export default class BlickTimeRestrictionOnAircraftsConstraint extends Constraint implements BlickTimeRestrictionOnAircraftsConstraintData {
  readonly maximumBlockTime: number;
  readonly aircraftSelection: AircraftSelection;

  constructor(masterDataConstraint: MasterDataConstraint) {
    super(
      ConstraintTemplate.all.BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS,
      masterDataConstraint.name,
      masterDataConstraint.description,
      masterDataConstraint.details,
      masterDataConstraint.fromDate,
      masterDataConstraint.toDate,
      masterDataConstraint.seasonType,
      ...masterDataConstraint.days
    );
    const data = masterDataConstraint.data as BlickTimeRestrictionOnAircraftsConstraintData;
    this.maximumBlockTime = data.maximumBlockTime;
    this.aircraftSelection = data.aircraftSelection;
  }
}
