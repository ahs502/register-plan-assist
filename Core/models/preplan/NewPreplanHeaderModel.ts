import Validation from '@ahs502/validation';

export default interface NewPreplanHeaderModel {
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

export class NewPreplanHeaderModelValidation extends Validation {
  constructor(data: NewPreplanHeaderModel, otherPreplanHeaderNames: readonly string[]) {
    super(validator =>
      validator.object(data).then(({ name, startDate, endDate }) => {
        validator.must(!!name, typeof name === 'string').must(() => !otherPreplanHeaderNames.includes(name));
        validator.must(!!startDate, typeof startDate === 'string', !!endDate, typeof endDate === 'string').then(() => {
          const start = new Date(startDate);
          const end = new Date(endDate);
          validator
            .must(start.isValid(), end.isValid())
            .must(
              () => start.getDatePart().equals(start),
              () => end.getDatePart().equals(end)
            )
            .must(
              () => start.toJSON() === startDate,
              () => end.toJSON() === endDate
            )
            .must(() => start <= end);
        });
      })
    );
  }
}
