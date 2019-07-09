import Validation from '@ahs502/validation';

export default interface FlightTimeModel {
  readonly stdLowerBound: number;
  readonly stdUpperBound: number;
}

export class FlightTimeValidation extends Validation<
  | 'STD_LOWER_BOUND_EXISTS'
  | 'STD_LOWER_BOUND_IS_VALID'
  | 'STD_LOWER_BOUND_IS_NOT_NEGATIVE'
  | 'STD_UPPER_BOUND_EXISTS'
  | 'STD_UPPER_BOUND_IS_VALID'
  | 'STD_UPPER_BOUND_IS_NOT_NEGATIVE'
  | 'STD_LOWER_BOUND_BEFORE_STD_UPPER_BOUND'
  | 'STD_UPPER_BOUND_AFTER_STD_LOWER_BOUND'
> {
  constructor(data: any) {
    super(
      validator =>
        validator.object(data).do(({ stdLowerBound, stdUpperBound }) => {
          validator
            .check('STD_LOWER_BOUND_EXISTS', stdLowerBound || stdLowerBound === 0 || isNaN(stdLowerBound))
            .check('STD_LOWER_BOUND_IS_VALID', () => !isNaN(stdLowerBound))
            .check('STD_LOWER_BOUND_IS_NOT_NEGATIVE', () => stdLowerBound >= 0);
          validator
            .check('STD_UPPER_BOUND_EXISTS', stdUpperBound || stdUpperBound === 0 || isNaN(stdUpperBound))
            .check('STD_UPPER_BOUND_IS_VALID', () => !isNaN(stdUpperBound))
            .check('STD_UPPER_BOUND_IS_NOT_NEGATIVE', () => stdUpperBound >= 0);
          validator
            .when('STD_LOWER_BOUND_IS_NOT_NEGATIVE', 'STD_UPPER_BOUND_IS_NOT_NEGATIVE')
            .check('STD_LOWER_BOUND_BEFORE_STD_UPPER_BOUND', () => stdLowerBound <= stdUpperBound)
            .also('STD_UPPER_BOUND_AFTER_STD_LOWER_BOUND');
        }),
      {
        STD_LOWER_BOUND_BEFORE_STD_UPPER_BOUND: 'Should be before STD upper bound.',
        STD_UPPER_BOUND_AFTER_STD_LOWER_BOUND: 'Should be after STD lower bound.'
      }
    );
  }
}
