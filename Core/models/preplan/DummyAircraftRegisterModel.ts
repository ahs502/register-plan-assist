import Id from '@core/types/Id';
import Validation from '@ahs502/validation';
import MasterData from '@core/master-data';

/**
 * A dummy aircraft register related to a specific preplan.
 */
export default interface DummyAircraftRegisterModel {
  /** The id of a dummy aircraft register starts with a 'dummy-' prefix. */ readonly id: Id;
  readonly name: string;
  readonly aircraftTypeId: Id;
}

export class DummyAircraftRegisterModelValidation extends Validation {
  constructor(data: DummyAircraftRegisterModel) {
    super(validator =>
      validator.object(data).then(({ id, name, aircraftTypeId }) => {
        validator.must(typeof id === 'string').must(() => /^dummy-\d+$/.test(id));
        validator.must(typeof name === 'string', !!name).must(() => 3 <= name.length && name.length <= 10 && name.trim().toUpperCase() === name);
        validator.must(typeof aircraftTypeId === 'string').must(() => aircraftTypeId in MasterData.all.aircraftTypes.id);
      })
    );
  }
}
