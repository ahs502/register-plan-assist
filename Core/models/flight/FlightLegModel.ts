import Validation from '@ahs502/validation';

export default interface FlightLegModel {
  readonly std: number;
}

export class FlightLegModelValidation extends Validation {
  constructor(data: FlightLegModel) {
    super(validator =>
      validator.object(data).then(({ std }) => {
        validator.must(typeof std === 'number', !isNaN(std)).must(() => std === Math.round(std));
      })
    );
  }
}
