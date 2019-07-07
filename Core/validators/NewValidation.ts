type Message = string;

type CommonBadge = 'EXISTS' | 'IS_VALID' | 'IS_NOT_NEGATIVE';
const CommonBadgeMessages: { readonly [badge in CommonBadge]: Message } = {
  EXISTS: 'Required.',
  IS_VALID: 'Invalid.',
  IS_NOT_NEGATIVE: 'Should be greater than 0.'
};

// type Badge<K extends string> = K extends CommonBadge ? K : { readonly badge: K; readonly message: Message };
type Badge<K extends string> = Extract<K, CommonBadge> | { readonly badge: Exclude<K, CommonBadge>; readonly message: Message };

function getBadgeMessage<K extends string>(badge: Badge<K>): Message {
  if (typeof badge === 'string') return CommonBadgeMessages[badge];
  return badge.message;
}

class Validation<K extends string, D = {}> {
  private readonly badges: Badge<K>[];
  private readonly failedBadges: Badge<K>[];
  private target: any;
  private path: (string | number)[];
  private readonly isFake: boolean;
  private readonly fake: Validation<K>;

  ok: boolean;
  readonly data: D;

  constructor(isFake?: boolean) {
    this.ok = true;
    this.badges = [];
    this.failedBadges = [];
    this.target = undefined;
    this.path = [];
    this.isFake = isFake;
    this.fake = isFake ? this : new Validation<K, D>(true);
    this.data = {} as D;
  }

  /**
   * Traverses through all validations inside this.data structure.
   * @param task The task to be applied to all validations, should return true to break traversing.
   */
  private traverseData(task: (validation: Validation<any>) => boolean): void {
    traverseItem(this.data);

    function traverseItem(item: any): boolean {
      if (!item) return false;
      if (item instanceof Validation) return task(item);
      if (Array.isArray(item)) return traverseArray(item);
      if (typeof item === 'object') return traverseObject(item);
      return false;
    }
    function traverseObject(object: { [key: string]: any }): boolean {
      for (const key in object) {
        if (traverseItem(object[key])) return true;
      }
      return false;
    }
    function traverseArray(array: Array<any>): boolean {
      for (let index = 0; index < array.length; ++index) {
        if (traverseItem(array[index])) return true;
      }
      return false;
    }
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
   * with respect to the given badges if provided.
   * @param badges Optional, the badges which the method is going to return messages for.
   */
  errors(...badges: K[]): readonly Message[] {
    const failedBadges = badges.length ? this.failedBadges.filter(b => badges.includes(typeof b === 'string' ? b : b.badge)) : this.failedBadges;
    return failedBadges.map(getBadgeMessage).filter(Boolean);
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

  /**
   * Blocks a validation chain iff this validation does not satisfy some of the given badges.
   * @param requiredBadges Badges or badge arrays.
   */
  when(...requiredBadges: (K | K[])[]): this {
    if (this.isFake) return this.fake as this;
    if (!requiredBadges.some(b => !(Array.isArray(b) ? this.has(...b) : this.has(b)))) return this;
    this.ok = false;
    return this.fake as this;
  }
  if(...conditions: (boolean | (() => boolean))[]): this {
    if (this.isFake) return this.fake as this;
    for (let i = 0; i < conditions.length; ++i) {
      const condition = conditions[i];
      if (typeof condition === 'function' ? !condition() : !condition) {
        this.ok = false;
        return this.fake as this;
      }
    }
    return this;
  }

  object(target: any): this {
    if (this.isFake) return this.fake as this;
    this.target = target;
    if (target && typeof target === 'object') return this;
    this.ok = false;
    return this.fake as this;
  }
  do(task: (target: any) => void): this {
    if (this.isFake) return this.fake as this;
    task(this.target);
    return this;
  }
  array(target: any): this {
    if (this.isFake) return this.fake as this;
    this.target = target;
    if (target && Array.isArray(target)) return this;
    this.ok = false;
    return this.fake as this;
  }
  for(task: (item: any, index: number) => void): this {
    if (this.isFake) return this.fake as this;
    (this.target as any[]).forEach(task);
    return this;
  }
  optional(target: any): this {
    if (this.isFake) return this.fake as this;
    this.target = target;
    if (target) return this;
    return this.fake as this;
  }

  check(badge: Badge<K>, validity: boolean | (() => boolean)): this {
    if (this.isFake) return this.fake as this;
    if (typeof validity === 'function' ? validity() : validity) {
      this.badges.push(badge);
      return this;
    }
    this.ok = false;
    this.failedBadges.push(badge);
    return this.fake as this;
  }
  in(...path: (string | number)[]): this {
    if (this.isFake) return this.fake as this;
    this.path = path;
    return this;
  }
  set(validation: Validation<any> | (() => Validation<any>)): this {
    if (this.isFake) return this.fake as this;
    const validationObject = typeof validation === 'function' ? validation() : validation;
    let data = this.data as any;
    this.path.slice(0, -1).forEach(property => (data = data[property]));
    data[this.path[this.path.length - 1]] = validationObject;
    if (validationObject.ok) return this;
    this.ok = false;
    return this.fake as this;
  }
}

/////////////////////////////////////////////////////////////

interface A {
  x: number;
  y: number;
}
type AValidationBadges = 'XVALID' | 'XPOSITIVE' | 'YVALID' | 'YPOSITIVE' | 'XLESSTHANY';
type AValidation = Validation<AValidationBadges>;
function validateA(a: any): AValidation {
  const validation = new Validation<AValidationBadges>();
  validation.object(a).do(({ x, y }) => {
    validation.check({ badge: 'XVALID', message: 'Invalid.' }, typeof x === 'number').check({ badge: 'XPOSITIVE', message: 'Invalid.' }, () => x > 0);
    validation.check({ badge: 'YVALID', message: 'Invalid.' }, typeof y === 'number').check({ badge: 'YPOSITIVE', message: 'Invalid.' }, () => y > 0);
    validation.when('XPOSITIVE', 'YPOSITIVE').check({ badge: 'XLESSTHANY', message: 'Invalid.' }, () => x < y);
  });
  return validation;
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
type BValidationBadges = 'ZVALID' | 'ZPOSITIVE' | 'ZMORETHANAXY' | 'ZMORETHANAAXONLY' | 'ZMORETHANOAXY' | 'ZMORETHANOAAXONLY';
interface BValidationData {
  a: AValidation;
  aa: AValidation[];
  o: {
    oa?: AValidation;
    oaa: (AValidation | undefined)[];
  };
}
type BValidation = Validation<BValidationBadges, BValidationData>;
function validateB(b: any): BValidation {
  const validation = new Validation<BValidationBadges, BValidationData>();
  validation.object(b).do(({ z, a, aa, o }) => {
    validation.check({ badge: 'ZVALID', message: 'Invalid.' }, typeof z === 'number').check({ badge: 'ZPOSITIVE', message: 'Invalid.' }, () => z > 0);
    validation
      .object(a)
      .in('a')
      .set(() => validateA(a))
      .when('ZPOSITIVE')
      .check({ badge: 'ZMORETHANAXY', message: 'Invalid.' }, () => z > a.x && z > a.y);
    validation
      .array(aa)
      .for((a, i) =>
        validation
          .object(a)
          .in('aa', i)
          .set(() => validateA(a))
      )
      .if(() => validation.data.aa.every(v => v.has('XPOSITIVE')))
      .check({ badge: 'ZMORETHANAAXONLY', message: 'Invalid.' }, () => aa.every(a => z > a.x));
    validation.object(o).do(({ oa, oaa }) => {
      validation
        .optional(oa)
        .object(oa)
        .in('o', 'oa')
        .set(() => validateA(oa))
        .when('ZPOSITIVE')
        .check({ badge: 'ZMORETHANOAXY', message: 'Invalid.' }, () => z > oa.x && z > oa.y);
      validation
        .array(oaa)
        .for((a, i) =>
          validation
            .optional(a)
            .object(a)
            .in('o', 'oaa', i)
            .set(() => validateA(a))
        )
        .if(() => validation.data.o.oaa.filter(Boolean).every(v => v.has('XPOSITIVE')))
        .check({ badge: 'ZMORETHANOAAXONLY', message: 'Invalid.' }, () => oaa.every(a => z > a.x));
    });
  });
  return validation;
}

/////////////////////////////////////////////////////////////

const a: any = {};
const aValidation = validateA(a);
aValidation.has('YPOSITIVE', 'XVALID');
aValidation.ok;
aValidation.errors();
aValidation.errors('XLESSTHANY');
aValidation.throwIfErrorsExist();

/////////////////////////////////////////////////////////////

const b: any = {};
const bValidation = validateB(b);
bValidation.data.o.oaa[3].has('XPOSITIVE');

/////////////////////////////////////////////////////////////
