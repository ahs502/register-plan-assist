import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterDataCollection from '@core/types/MasterDataCollection';
import AircraftTypeModel from '@core/models/master-data/AircraftTypeModel';

/**
 * A dummy aircraft register related to a specific preplan.
 */
export default interface DummyAircraftRegisterModel {
  /** The id of a dummy aircraft register starts with a 'dummy-' prefix. */ readonly id: Id;
  readonly name: string;
  readonly aircraftTypeId: Id;
}

export class DummyAircraftRegisterModelValidation extends Validation {
  constructor(data: DummyAircraftRegisterModel, aircraftTypes: MasterDataCollection<AircraftTypeModel>) {
    super(validator =>
      validator.object(data).then(({ id, name, aircraftTypeId }) => {
        validator.must(typeof id === 'string').must(() => /^dummy-\d+$/.test(id));
        validator.must(typeof name === 'string', !!name).must(() => 3 <= name.length && name.length <= 10 && name.trim().toUpperCase() === name);
        validator.must(typeof aircraftTypeId === 'string').must(() => aircraftTypeId in aircraftTypes.id);
      })
    );
  }
}

export class DummyAircraftRegisterModelArrayValidation extends Validation<
  string,
  {
    items: DummyAircraftRegisterModelValidation[];
  }
> {
  constructor(data: readonly DummyAircraftRegisterModel[], aircraftTypes: MasterDataCollection<AircraftTypeModel>) {
    super(validator =>
      validator
        .array(data)
        .each((register, index) => validator.put(validator.$.items[index], new DummyAircraftRegisterModelValidation(register, aircraftTypes)))
        .must(() => data.map(r => r.id).distinct().length === data.length)
        .must(() => data.map(r => r.name).distinct().length === data.length)
    );
  }
}
