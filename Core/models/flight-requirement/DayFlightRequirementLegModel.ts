import Validation from '@ahs502/validation';

export default interface DayFlightRequirementLegModel {
  readonly blockTime: number;
  readonly stdLowerBound: number;
  readonly stdUpperBound?: number;
  readonly originPermission: boolean;
  readonly destinationPermission: boolean;
  readonly originPermissionNote: string;
  readonly destinationPermissionNote: string;
}

export class DayFlightRequirementLegModelValidation extends Validation {
  constructor(data: DayFlightRequirementLegModel) {
    super(validator =>
      validator.object(data).then(({ blockTime, stdLowerBound, stdUpperBound, originPermission, destinationPermission, originPermissionNote, destinationPermissionNote }) => {
        validator.must(typeof blockTime === 'number', !isNaN(blockTime)).must(() => blockTime > 0 && blockTime <= 16 * 60);
        validator.must(typeof stdLowerBound === 'number', !isNaN(stdLowerBound)).then(() => stdUpperBound! >= 0);
        validator
          .if(stdUpperBound !== undefined)
          .must(
            () => typeof stdUpperBound === 'number',
            () => !isNaN(stdUpperBound!)
          )
          .must(() => stdUpperBound! > 0);
        validator.must(
          typeof originPermission === 'boolean',
          typeof destinationPermission === 'boolean',
          typeof originPermissionNote === 'string',
          typeof destinationPermissionNote === 'string'
        );
      })
    );
  }
}
