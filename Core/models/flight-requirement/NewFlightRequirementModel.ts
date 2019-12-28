import AircraftSelectionModel, { AircraftSelectionModelValidation } from '../AircraftSelectionModel';
import Rsx, { Rsxes } from '@core/types/Rsx';
import FlightRequirementLegModel, { FlightRequirementLegModelValidation } from './FlightRequirementLegModel';
import DayFlightRequirementModel, { DayFlightRequirementModelValidation } from './DayFlightRequirementModel';
import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import FlightRequirementChangeModel, { FlightRequirementChangeModelValidation } from '@core/models/flight-requirement/FlightRequirementChangeModel';
import MasterDataCollection from '@core/types/MasterDataCollection';
import StcModel from '@core/models/master-data/StcModel';
import AirportModel from '@core/models/master-data/AirportModel';
import AircraftTypeModel from '@core/models/master-data/AircraftTypeModel';
import AircraftRegisterModel from '@core/models/master-data/AircraftRegisterModel';
import AircraftRegisterGroupModel from '@core/models/master-data/AircraftRegisterGroupModel';

export default interface NewFlightRequirementModel {
  readonly label: string;
  readonly category: string;
  readonly stcId: Id;
  readonly aircraftSelection: AircraftSelectionModel;
  readonly rsx: Rsx;
  readonly notes: string;
  readonly ignored: boolean;
  readonly route: readonly FlightRequirementLegModel[];
  readonly days: readonly DayFlightRequirementModel[];
  readonly changes: readonly FlightRequirementChangeModel[];
}

export class NewFlightRequirementModelValidation extends Validation<
  string,
  {
    aircraftSelection: AircraftSelectionModelValidation;
    route: FlightRequirementLegModelValidation[];
    days: DayFlightRequirementModelValidation[];
    changes: FlightRequirementChangeModelValidation[];
  }
> {
  constructor(
    data: NewFlightRequirementModel,
    aircraftTypes: MasterDataCollection<AircraftTypeModel>,
    aircraftRegisters: MasterDataCollection<AircraftRegisterModel>,
    aircraftRegisterGroups: MasterDataCollection<AircraftRegisterGroupModel>,
    airports: MasterDataCollection<AirportModel>,
    stcs: MasterDataCollection<StcModel>,
    otherExistingLabels: readonly string[],
    dummyAircraftRegisterIds: readonly Id[],
    preplanStartDate: Date,
    preplanEndDate: Date
  ) {
    super(validator =>
      validator.object(data).then(({ label, category, stcId, aircraftSelection, rsx, notes, ignored, route, days, changes }) => {
        validator
          .must(typeof label === 'string', !!label)
          .must(() => label === label.trim().toUpperCase())
          .must(() => label.length <= 100)
          .must(() => !otherExistingLabels.includes(label));
        validator
          .must(typeof category === 'string')
          .must(() => category === category.trim())
          .must(() => category.length <= 100);
        validator.must(typeof stcId === 'string').must(() => stcId in stcs.id);
        validator.put(
          validator.$.aircraftSelection,
          new AircraftSelectionModelValidation(aircraftSelection, aircraftTypes, aircraftRegisters, aircraftRegisterGroups, dummyAircraftRegisterIds)
        );
        validator.must(Rsxes.includes(rsx));
        validator.must(typeof notes === 'string').must(() => notes.length <= 1000);
        validator.must(typeof ignored === 'boolean');
        validator
          .array(route)
          .must(() => route.length > 0)
          .each((leg, index) => validator.put(validator.$.route[index], new FlightRequirementLegModelValidation(leg, airports)));
        validator
          .array(days)
          .each((day, index) =>
            validator.put(validator.$.days[index], new DayFlightRequirementModelValidation(day, aircraftTypes, aircraftRegisters, aircraftRegisterGroups, dummyAircraftRegisterIds))
          );
        validator
          .array(changes)
          .each((change, index) =>
            validator.put(
              validator.$.changes[index],
              new FlightRequirementChangeModelValidation(
                change,
                aircraftTypes,
                aircraftRegisters,
                aircraftRegisterGroups,
                preplanStartDate,
                preplanEndDate,
                dummyAircraftRegisterIds
              )
            )
          )
          .if(validations => validations.every(v => v.ok))
          .then(() => changes.orderBy('startDate'))
          .each((change, index, changes) => validator.must(index === changes.length - 1 ? true : change.endDate <= changes[index + 1].startDate));
      })
    );
  }
}
