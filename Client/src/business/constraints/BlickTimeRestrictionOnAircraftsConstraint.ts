import { default as MasterDataConstraint, BlockTimeRestrictionOnAircraftsConstraintData } from '@core/master-data/Constraint';
import Constraint from './Constraint';
import ConstraintTemplate from 'src/business/constraints/ConstraintTemplate';
import { AircraftSelection } from '@core/master-data';

export default class BlickTimeRestrictionOnAircraftsConstraint extends Constraint implements BlockTimeRestrictionOnAircraftsConstraintData {
  readonly maximumBlockTime: number;
  readonly aircraftSelection: AircraftSelection;

  constructor(masterDataConstraint: MasterDataConstraint) {
    super(
      ConstraintTemplate.all.BLOCK_TIME_RESTRICTION_ON_AIRCRAFTS,
      masterDataConstraint.name,
      masterDataConstraint.description,
      masterDataConstraint.details,
      masterDataConstraint.scope.fromDate,
      masterDataConstraint.scope.toDate,
      masterDataConstraint.scope.seasonType,
      ...masterDataConstraint.scope.days
    );
    const data = masterDataConstraint.data as BlockTimeRestrictionOnAircraftsConstraintData;
    this.maximumBlockTime = data.maximumBlockTime;
    this.aircraftSelection = data.aircraftSelection;
  }
}
