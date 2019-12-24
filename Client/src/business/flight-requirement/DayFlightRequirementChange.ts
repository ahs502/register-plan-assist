import ModelConvertable from 'src/business/ModelConvertable';
import Rsx from '@core/types/Rsx';
import Weekday from '@core/types/Weekday';
import PreplanAircraftSelection from 'src/business/preplan/PreplanAircraftSelection';
import DayFlightRequirementLegChange from 'src/business/flight-requirement/DayFlightRequirementLegChange';
import DayFlightRequirementChangeModel from '@core/models/flight-requirement/DayFlightRequirementChangeModel';
import { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import { dataTypes } from 'src/utils/DataType';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightRequirementChange from 'src/business/flight-requirement/FlightRequirementChange';

export default class DayFlightRequirementChange implements ModelConvertable<DayFlightRequirementChangeModel> {
  readonly aircraftSelection: PreplanAircraftSelection;
  readonly rsx: Rsx;
  readonly day: Weekday;
  readonly notes: string;
  readonly route: readonly DayFlightRequirementLegChange[];

  constructor(
    raw: DayFlightRequirementChangeModel,
    aircraftRegisters: PreplanAircraftRegisters,
    readonly flightRequirement: FlightRequirement,
    readonly flightRequirementChange: FlightRequirementChange
  ) {
    this.aircraftSelection = new PreplanAircraftSelection(raw.aircraftSelection, aircraftRegisters);
    this.rsx = raw.rsx;
    this.day = raw.day;
    this.notes = dataTypes.label.convertModelToBusiness(raw.notes);

    let dayOffset = 0;
    let previousStaLowerBound = Number.NEGATIVE_INFINITY;
    const route: DayFlightRequirementLegChange[] = (this.route = []);
    raw.route.forEach((leg, index) => {
      let stdLowerBound = leg.stdLowerBound + dayOffset * 24 * 60;
      let stdUpperBound = (leg.stdUpperBound === undefined ? leg.stdLowerBound : leg.stdUpperBound) + dayOffset * 24 * 60;
      while (stdUpperBound < stdLowerBound) {
        stdUpperBound += 24 * 60;
      }
      while (stdUpperBound <= previousStaLowerBound) {
        dayOffset++;
        stdLowerBound += 24 * 60;
        stdUpperBound += 24 * 60;
      }
      route.push(
        new DayFlightRequirementLegChange(
          leg,
          index,
          dayOffset,
          flightRequirement,
          flightRequirementChange,
          flightRequirement.route[index],
          flightRequirementChange.route[index],
          flightRequirement.days.find(d => d.day === this.day)!,
          this
        )
      );
      previousStaLowerBound = stdLowerBound + leg.blockTime;
    });
  }

  extractModel(override?: (dayFlightRequirementChangeModel: DayFlightRequirementChangeModel) => DayFlightRequirementChangeModel): DayFlightRequirementChangeModel {
    const dayFlightRequirementChangeModel: DayFlightRequirementChangeModel = {
      aircraftSelection: this.aircraftSelection.extractModel(),
      rsx: this.rsx,
      day: this.day,
      notes: dataTypes.label.convertBusinessToModel(this.notes),
      route: this.route.map(l => l.extractModel())
    };
    return override?.(dayFlightRequirementChangeModel) ?? dayFlightRequirementChangeModel;
  }
}
