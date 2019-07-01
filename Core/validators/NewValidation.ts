type Message = string;

type CommonBadge = 'EXISTS' | 'IS_VALID' | 'IS_NOT_NEGATIVE';
const CommonBadgeMessages: { readonly [badge in CommonBadge]: Message } = {
  EXISTS: 'Required.',
  IS_VALID: 'Invalid.',
  IS_NOT_NEGATIVE: 'Should be greater than 0.'
};

type Badge<K extends string> = K extends CommonBadge ? K : { readonly badge: K; readonly message: Message };
// type Badge<K extends string> = Extract<K, CommonBadge> | { readonly badge: Exclude<K, CommonBadge>; readonly message: Message };

function getBadgeMessage<K extends string>(badge: Badge<K>): Message {
  if (typeof badge === 'string') return CommonBadgeMessages[badge];
  return badge.message;
}

type ValidationDataObject = { [key: string]: ValidationData | Validation<any, ValidationData> };
type ValidationDataArray = readonly (Validation | Validation<any, ValidationData>)[];
type Validation = ValidationDataObject | ValidationDataArray;

class Validation<K extends string, D extends ValidationData = undefined> {
  private _ok: boolean;
  private badges: Badge<K>[];
  private failedBadges: Badge<K>[];

  readonly data?: D;

  constructor();
  constructor(data?: D);
  constructor(data?: D, isFake: boolean = false) {
    this._ok = true;
    this.badges = [];
    this.failedBadges = [];
    this.data = data;
  }

  get ok() {
    return this._ok;
  }
  hasBadge(badge: K): boolean {
    return this.badges.some(b => (typeof b === 'string' ? b === badge : b.badge === badge));
  }
  getMessages(): readonly Message[] {
    return this.failedBadges.map(getBadgeMessage).filter(Boolean);
  }
  getMessage(): Message | null {
    if (this._ok) return null;
    const messages = this.getMessages();
    if (messages.length) return messages[0];
    return 'Error.';
  }
  throwIfErrorExists(): void {
    if (this._ok) return;
    const messages = this.getMessages();
    if (messages.length) throw messages[0];
    throw 'Invalid API input arguments.';
  }
}

/////////////////////////////////////////////////////////////

// const data = {
//   field1: new Validation<'E1'>()
// };
const data = Array.range(0, 10).reduce((a, i) => ((a[i] = { a: new Validation<'E1'>() }), a), {});
const validation = new Validation<'EXISTS' | 'OTHER_BADGE', typeof data>(data);
const xxxxxx = validation.data![8].data!;
