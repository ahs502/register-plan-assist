import Validation from '@ahs502/validation';

export default interface NewPreplanModel {
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

// //TODO: Not implemented.
// export class NewPreplanModelValidation extends Validation<''> {
//   constructor(newPreplan: NewPreplanModel, userPreplanNames: readonly string[]) {
//     super(validator => {});
//   }
// }
