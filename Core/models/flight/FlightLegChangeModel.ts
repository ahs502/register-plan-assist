import Validation from '@ahs502/validation';

export default interface FlightLegChangeModel {
  readonly std: number;
}

export class FlightLegChangeModelValidation extends Validation {
  constructor(data: FlightLegChangeModel) {
    super(validator =>
      validator.object(data).then(({ std }) => {
        validator.must(typeof std === 'number', !isNaN(std)).must(() => std === Math.round(std));
      })
    );
  }
}
