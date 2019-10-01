import Id from '@core/types/Id';

/**
 * A dummy aircraft register related to a specific preplan.
 */
export default interface DummyAircraftRegisterModel {
  /** The id of a dummy aircraft register starts with a 'dummy-' prefix. */ readonly id: Id;
  readonly name: string;
  readonly aircraftTypeId: Id;
}
