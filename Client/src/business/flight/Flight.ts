import FlightModel from '@core/models/flight/FlightModel';
import DayFlightRequirement from 'src/business/flight-requirement/DayFlightRequirement';
import FlightRequirement from 'src/business/flight-requirement/FlightRequirement';
import FlightLeg from 'src/business/flight/FlightLeg';
import PreplanAircraftRegister, { PreplanAircraftRegisters } from 'src/business/preplan/PreplanAircraftRegister';
import { Stc } from 'src/business/master-data';
import Rsx from '@core/types/Rsx';
import Weekday from '@core/types/Weekday';
import Id from '@core/types/Id';
import ModelConvertable from 'src/business/ModelConvertable';
import { dataTypes } from 'src/utils/DataType';
import FlightRequirementChange from 'src/business/flight-requirement/FlightRequirementChange';
import DayFlightRequirementChange from 'src/business/flight-requirement/DayFlightRequirementChange';

export default class Flight implements ModelConvertable<FlightModel> {
  // Original:
  readonly id: Id;
  readonly date: Date;
  readonly aircraftRegister?: PreplanAircraftRegister;
  readonly legs: readonly FlightLeg[];

  // References:
  readonly aircraftRegisters: PreplanAircraftRegisters;
  readonly flightRequirement: FlightRequirement;
  readonly dayFlightRequirement: DayFlightRequirement;
  readonly change?: {
    readonly flightRequirement: FlightRequirementChange;
    readonly dayFlightRequirement: DayFlightRequirementChange;
  };

  // Duplicates:
  readonly label: string;
  readonly category: string;
  readonly stc: Stc;
  readonly rsx: Rsx;
  readonly day: Weekday;
  readonly notes: string;
  readonly originPermission: boolean | undefined;
  readonly destinationPermission: boolean | undefined;

  constructor(raw: FlightModel, aircraftRegisters: PreplanAircraftRegisters, dayFlightRequirement: DayFlightRequirement, dayFlightRequirementChange?: DayFlightRequirementChange) {
    this.id = raw.id;
    this.date = dataTypes.utcDate.convertModelToBusiness(raw.date);
    this.aircraftRegister = dataTypes.preplanAircraftRegister(aircraftRegisters).convertModelToBusinessOptional(raw.aircraftRegisterId);
    this.legs = raw.legs.map((l, index) => new FlightLeg(l, this, dayFlightRequirement.route[index], dayFlightRequirementChange && dayFlightRequirementChange.route[index]));

    this.aircraftRegisters = aircraftRegisters;
    this.flightRequirement = dayFlightRequirement.flightRequirement;
    this.dayFlightRequirement = dayFlightRequirement;
    this.change = dayFlightRequirementChange && {
      flightRequirement: dayFlightRequirementChange.flightRequirementChange,
      dayFlightRequirement: dayFlightRequirementChange
    };

    this.label = dayFlightRequirement.flightRequirement.label;
    this.category = dayFlightRequirement.flightRequirement.category;
    this.stc = dayFlightRequirement.flightRequirement.stc;
    this.rsx = (this.change?.dayFlightRequirement ?? dayFlightRequirement).rsx;
    this.day = dayFlightRequirement.day;
    this.notes = (this.change?.dayFlightRequirement ?? dayFlightRequirement).notes;
    const originPermissions = (this.change?.dayFlightRequirement.route.map(l => l.originPermission) ?? dayFlightRequirement.route.map(l => l.originPermission)).distinct();
    this.originPermission = originPermissions.length === 2 ? undefined : originPermissions.length === 1 ? originPermissions[0] : false;
    const destinationPermissions = (
      this.change?.dayFlightRequirement.route.map(l => l.destinationPermission) ?? dayFlightRequirement.route.map(l => l.destinationPermission)
    ).distinct();
    this.destinationPermission = destinationPermissions.length === 2 ? undefined : destinationPermissions.length === 1 ? destinationPermissions[0] : false;
  }

  extractModel(override?: (flightModel: FlightModel) => FlightModel): FlightModel {
    const flightModel: FlightModel = {
      id: this.id,
      flightRequirementId: this.flightRequirement.id,
      date: dataTypes.utcDate.convertBusinessToModel(this.date),
      aircraftRegisterId: dataTypes.preplanAircraftRegister(this.aircraftRegisters).convertBusinessToModelOptional(this.aircraftRegister),
      legs: this.legs.map(l => l.extractModel())
    };
    return override?.(flightModel) ?? flightModel;
  }
}
