import Validation from '@ahs502/validation';

export default interface NewPreplanModel {
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

export class NewPreplanModelValidation extends Validation {
  constructor(data: NewPreplanModel, otherPreplanNames: readonly string[]) {
    super(validator =>
      validator.object(data).then(({ name, startDate, endDate }) => {
        validator.must(!!name, typeof name === 'string').must(() => !otherPreplanNames.includes(name));
        validator.must(!!startDate, typeof startDate === 'string', !!endDate, typeof endDate === 'string').then(() => {
          const start = new Date(startDate);
          const end = new Date(endDate);
          validator
            .must(start.isValid(), end.isValid())
            .must(() => start.getTimePart().getTime() === 0, () => end.getTimePart().getTime() === 0)
            .must(() => start.toJSON() === startDate, () => end.toJSON() === endDate)
            .must(() => start <= end);
        });
      })
    );
  }
}
