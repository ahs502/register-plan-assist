import Validation from '@ahs502/validation';

export default interface EditPreplanModel {
  readonly id: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate: string;
}

// //TODO: Not implemented.
// export class EditPreplanModelValidation extends Validation<''> {
//   constructor(editPreplan: EditPreplanModel, userPreplanNames: string[]) {
//     super(validator => {});
//   }
// }
