export type Message = string;
export type Badge<K extends string> = K | { readonly badge: K; readonly message: Message };

const commonBadgeFailureMessages: readonly { postfix: string; message: Message }[] = [
  { postfix: 'EXISTS', message: 'Required.' },
  { postfix: 'IS_VALID', message: 'Invalid.' },
  { postfix: 'IS_NOT_NEGATIVE', message: 'Should not be negative.' }
];
function getBadgeFailureMessage<K extends string>(badge: Badge<K>, dictionary: { readonly [badge in K]?: Message }): Message {
  if (typeof badge === 'object') return badge.message;
  if (badge in dictionary) return dictionary[badge];
  const commonBadgeFailureMessage = commonBadgeFailureMessages.find(c => badge.endsWith(c.postfix));
  if (commonBadgeFailureMessage) return commonBadgeFailureMessage.message;
  return `Failed @ ${badge}`;
}

class Validator<K extends string, D extends {} = {}> {
  readonly data: D;
  private readonly validation: Validation<K, D>;
  private readonly blackhole: this;
  private target: any;
  private path: (string | number)[];

  constructor(validation: Validation<K, D>) {
    const me = this;
    this.data = validation.data;
    this.validation = validation;
    this.blackhole = new Proxy({}, { get: () => me.blackhole }) as this;
    this.target = undefined;
    this.path = [];
  }

  /**
   * Returns true iff this validation satisfies all the given badges.
   * @param badges The badges to be checked.
   */
  has(...badges: K[]): boolean {
    return this.validation.has(...badges);
  }

  /**
   * Blocks a validation chain iff this validation does not satisfy some of the given badges.
   * @param requiredBadges Badges or badge arrays.
   */
  when(...requiredBadges: (K | K[])[]): this {
    if (!requiredBadges.some(b => !(Array.isArray(b) ? this.has(...b) : this.has(b)))) return this;
    this.validation.ok = false;
    return this.blackhole;
  }
  if(...conditions: (boolean | (() => boolean))[]): this {
    for (let i = 0; i < conditions.length; ++i) {
      const condition = conditions[i];
      if (typeof condition === 'function' ? !condition() : !condition) {
        this.validation.ok = false;
        return this.blackhole;
      }
    }
    return this;
  }

  object(target: any): this {
    this.target = target;
    if (target && typeof target === 'object') return this;
    this.validation.ok = false;
    return this.blackhole;
  }
  do(task: (target: any) => void): this {
    task(this.target);
    return this;
  }
  array(target: any): this {
    this.target = target;
    if (target && Array.isArray(target)) return this;
    this.validation.ok = false;
    return this.blackhole;
  }
  for(task: (item: any, index: number) => void): this {
    (this.target as any[]).forEach(task);
    return this;
  }
  optional(target: any): this {
    this.target = target;
    if (target) return this;
    return this.blackhole;
  }

  check(badge: Badge<K>, validity: boolean | (() => boolean)): this {
    if (typeof validity === 'function' ? validity() : validity) {
      this.validation.badges.push(badge);
      return this;
    }
    this.validation.ok = false;
    this.validation.failedBadges.push(badge);
    return this.blackhole;
  }
  also(badge: Badge<K>): this {
    this.validation.badges.push(badge);
    return this;
  }
  in(...path: (string | number)[]): this {
    this.path = path;
    return this;
  }
  set(validation: Validation<any> | (() => Validation<any>)): this {
    const validationObject = typeof validation === 'function' ? validation() : validation;
    let data = this.validation.data as any;
    this.path.slice(0, -1).forEach((property, index) => {
      if (!data[property]) {
        const nextProperty = this.path[index + 1];
        data[property] = typeof nextProperty === 'number' ? [] : {};
      }
      data = data[property];
    });
    data[this.path[this.path.length - 1]] = validationObject;
    if (validationObject.ok) return this;
    this.validation.ok = false;
    return this.blackhole;
  }
}

export default class Validation<K extends string, D extends {} = {}> {
  ok: boolean;
  readonly data: D;
  readonly badges: Badge<K>[];
  readonly failedBadges: Badge<K>[];
  private readonly badgeFailureMessagesDictionary: { readonly [badge in K]?: Message };

  protected constructor(validation: (validator: Validator<K, D>) => void, badgeFailureMessagesDictionary: { readonly [badge in K]?: Message } = {}) {
    this.ok = true;
    this.data = {} as D;
    this.badges = [];
    this.failedBadges = [];
    this.badgeFailureMessagesDictionary = badgeFailureMessagesDictionary;

    validation(new Validator(this));
  }

  /**
   * Traverses through all validations inside this.data structure.
   * @param task The task to be applied to all validations, should return true to break traversing.
   */
  private traverseData(task: (validation: Validation<any>) => boolean): void {
    (function traverseItem(item: any): boolean {
      if (!item) return false;
      if (item instanceof Validation) return task(item);
      if (Array.isArray(item)) {
        for (let index = 0; index < item.length; ++index) {
          if (traverseItem(item[index])) return true;
        }
      } else if (typeof item === 'object') {
        for (const key in item) {
          if (traverseItem(item[key])) return true;
        }
      }
      return false;
    })(this.data);
  }

  /**
   * Returns true iff this validation satisfies all the given badges.
   * @param badges The badges to be checked.
   */
  has(...badges: K[]): boolean {
    return badges.every(badge => this.badges.some(b => (typeof b === 'string' ? b === badge : b.badge === badge)));
  }

  /**
   * Returns the list of all error messages of this validation,
   * with respect to the given badges or badge prefixes if provided.
   * @param badges Optional, the badges or badge prefixes which the method is going to
   * return messages for. Badge prefixes end with a '*' character.
   */
  errors(...badges: (K | string)[]): readonly Message[] {
    const failedBadges = badges.length
      ? this.failedBadges.filter(b => {
          const bb = typeof b === 'string' ? b : b.badge;
          return badges.some(badge => (badge.endsWith('*') ? bb.startsWith(badge.slice(0, -1)) : bb === badge));
        })
      : this.failedBadges;
    return failedBadges.map(b => getBadgeFailureMessage(b, this.badgeFailureMessagesDictionary)).filter(Boolean);
  }

  /**
   * Throws an unempty exception iff this validation does not passes deeply.
   */
  throwIfErrorsExist(): void {
    if (this.ok) return;
    let messages = this.errors();
    if (messages.length) throw messages[0];
    this.traverseData(validation => ((messages = validation.errors()), messages.length > 0));
    if (messages.length) throw messages[0];
    throw 'Invalid API input arguments.';
  }
}

/////////////////////////////////////////////////////////////

interface A {
  x: number;
  y: number;
}

class AValidation extends Validation<'XVALID' | 'XPOSITIVE' | 'YVALID' | 'YPOSITIVE' | 'XLESSTHANY'> {
  constructor(a: any) {
    super(
      validator => {
        validator.object(a).do(({ x, y }) => {
          validator.check({ badge: 'XVALID', message: 'Invalid.' }, typeof x === 'number').check({ badge: 'XPOSITIVE', message: 'Invalid.' }, () => x > 0);
          validator.check({ badge: 'YVALID', message: 'Invalid.' }, typeof y === 'number').check({ badge: 'YPOSITIVE', message: 'Invalid.' }, () => y > 0);
          validator.when('XPOSITIVE', 'YPOSITIVE').check({ badge: 'XLESSTHANY', message: 'Invalid.' }, () => x < y);
        });
      },
      { XVALID: 'X is invalid.' }
    );
  }
}

/////////////////////////////////////////////////////////////

interface B {
  z: number;
  a: A;
  aa: A[];
  o: {
    oa?: A;
    oaa: (A | undefined)[];
  };
}

class BValidation extends Validation<
  'ZVALID' | 'ZPOSITIVE' | 'ZMORETHANAXY' | 'ZMORETHANAAXONLY' | 'ZMORETHANOAXY' | 'ZMORETHANOAAXONLY',
  {
    a: AValidation;
    aa: AValidation[];
    o: {
      oa?: AValidation;
      oaa: (AValidation | undefined)[];
    };
  }
> {
  constructor(b: any) {
    super(validator =>
      validator.object(b).do(({ z, a, aa, o }) => {
        validator.check({ badge: 'ZVALID', message: 'Invalid.' }, typeof z === 'number').check({ badge: 'ZPOSITIVE', message: 'Invalid.' }, () => z > 0);
        validator
          .object(a)
          .in('a')
          .set(() => new AValidation(a))
          .when('ZPOSITIVE')
          .check({ badge: 'ZMORETHANAXY', message: 'Invalid.' }, () => z > a.x && z > a.y);
        validator
          .array(aa)
          .for((a, i) =>
            validator
              .object(a)
              .in('aa', i)
              .set(() => new AValidation(a))
          )
          .if(() => validator.data.aa.every(v => v.has('XPOSITIVE')))
          .check({ badge: 'ZMORETHANAAXONLY', message: 'Invalid.' }, () => aa.every(a => z > a.x));
        validator.object(o).do(({ oa, oaa }) => {
          validator
            .optional(oa)
            .object(oa)
            .in('o', 'oa')
            .set(() => new AValidation(oa))
            .when('ZPOSITIVE')
            .check({ badge: 'ZMORETHANOAXY', message: 'Invalid.' }, () => z > oa.x && z > oa.y);
          validator
            .array(oaa)
            .for((a, i) =>
              validator
                .optional(a)
                .object(a)
                .in('o', 'oaa', i)
                .set(() => new AValidation(a))
            )
            .if(() => validator.data.o.oaa.filter(Boolean).every(v => v.has('XPOSITIVE')))
            .check({ badge: 'ZMORETHANOAAXONLY', message: 'Invalid.' }, () => oaa.every(a => z > a.x));
        });
      })
    );
  }
}

/////////////////////////////////////////////////////////////

const a: any = {};
const aValidation = new AValidation(a);
aValidation.has('YPOSITIVE', 'XVALID');
aValidation.ok;
aValidation.errors();
aValidation.errors('XLESSTHANY');
aValidation.throwIfErrorsExist();

/////////////////////////////////////////////////////////////

const b: any = {};
const bValidation = new BValidation(b);
bValidation.data.o.oaa[3].has('XPOSITIVE');

/////////////////////////////////////////////////////////////
