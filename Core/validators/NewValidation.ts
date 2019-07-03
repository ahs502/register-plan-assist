// type Message = string;

// type CommonBadge = 'EXISTS' | 'IS_VALID' | 'IS_NOT_NEGATIVE';
// const CommonBadgeMessages: { readonly [badge in CommonBadge]: Message } = {
//   EXISTS: 'Required.',
//   IS_VALID: 'Invalid.',
//   IS_NOT_NEGATIVE: 'Should be greater than 0.'
// };

// // type Badge<K extends string> = K extends CommonBadge ? K : { readonly badge: K; readonly message: Message };
// type Badge<K extends string> = Extract<K, CommonBadge> | { readonly badge: Exclude<K, CommonBadge>; readonly message: Message };

// function getBadgeMessage<K extends string>(badge: Badge<K>): Message {
//   if (typeof badge === 'string') return CommonBadgeMessages[badge];
//   return badge.message;
// }

// class Validation<K extends string, D = {}> {
//   private isOk: boolean;
//   private readonly badges: Badge<K>[];
//   private readonly failedBadges: Badge<K>[];
//   private isFake: boolean;
//   private fakeValidation: Validation<K>;

//   readonly data: D;

//   constructor();
//   constructor(isFake: boolean = false) {
//     this.isOk = true;
//     this.badges = [];
//     this.failedBadges = [];
//     this.isFake = isFake;
//     this.fakeValidation = isFake ? this : new Validation<K, D>(true);
//     this.data = {} as D;
//   }

//   /**
//    * Traverses through all validations inside this.data structure.
//    * @param task The task to be applied to all validations, should return true to break traversing.
//    */
//   private traverseData(task: (validation: Validation<any>) => boolean) {
//     traverseItem(this.data);

//     function traverseObject(object: { [key: string]: any }): boolean {
//       for (const key in object) {
//         if (traverseItem(object[key])) return true;
//       }
//       return false;
//     }
//     function traverseArray(array: Array<any>): boolean {
//       for (let index = 0; index < array.length; ++index) {
//         if (traverseItem(array[index])) return true;
//       }
//       return false;
//     }
//     function traverseItem(item: any): boolean {
//       if (!item) return false;
//       if (item instanceof Validation) return task(item);
//       if (Array.isArray(item)) return traverseArray(item);
//       if (typeof item === 'object') return traverseObject(item);
//       return false;
//     }
//   }

//   get ok() {
//     if (!this.isOk) return false;
//     let isOk = true;
//     this.traverseData(validation => !(isOk = validation.isOk));
//     return isOk;
//   }
//   hasBadge(badge: K): boolean {
//     return this.badges.some(b => (typeof b === 'string' ? b === badge : b.badge === badge));
//   }
//   getMessages(...badges: K[]): readonly Message[] {
//     const failedBadges = badges.length ? this.failedBadges.filter(b => badges.includes(typeof b === 'string' ? b : b.badge)) : this.failedBadges;
//     return failedBadges.map(getBadgeMessage).filter(Boolean);
//   }
//   throwIfErrorExists(): void {
//     if (this.ok) return;
//     let messages = this.getMessages();
//     if (messages.length) throw messages[0];
//     this.traverseData(validation => ((messages = validation.getMessages()), messages.length > 0));
//     if (messages.length) throw messages[0];
//     throw 'Invalid API input arguments.';
//   }
// }

// /////////////////////////////////////////////////////////////

// // const data = {
// //   field1: new Validation<'E1'>()
// // };
// const data = Array.range(0, 10).reduce((a, i) => ((a[i] = { a: new Validation<'E1'>() }), a), {});
// const validation = new Validation<'EXISTS' | 'OTHER_BADGE', typeof data>(data);
// const xxxxxx = validation.data![8].data!;

// /////////////////////////////////////////////////////////////////////////

// /*

//  */
