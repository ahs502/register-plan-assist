import Id from '@core/types/Id';

export default interface PreplanVersionModel {
  readonly id: Id;

  readonly current: boolean;
  readonly lastEditDateTime: string;
  readonly description: string;

  readonly simulation?: {
    readonly id: Id;
    readonly name: string;
  };
}
