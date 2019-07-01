export type ServerResult<T = any> = { message?: string; value?: T };

export default class Validation<K extends string> {
  ok: boolean;
  messages: { badge: K; index?: string | number; subIndex?: string | number; message: string }[];
  badges: { badge: K; index?: string | number; subIndex?: string | number }[];

  private isFake: boolean;
  private fakeValidation: Validation<K>;

  constructor(isFake: boolean = false) {
    this.ok = true;
    this.messages = [];
    this.badges = [];
    this.isFake = isFake;
    this.fakeValidation = isFake ? this : new Validation(true);
  }

  when(
    ...requiredBadges: (K | { badge: K; index?: string | number; subIndex?: string | number } | K | { badge: K; index?: string | number; subIndex?: string | number }[])[]
  ): Validation<K> {
    if (this.isFake) return this.fakeValidation;
    for (let i = 0; i < requiredBadges.length; ++i) {
      const r = requiredBadges[i];
      if (typeof r === 'string' && this.badges.every(b => b.badge !== r || b.index !== undefined || b.subIndex !== undefined)) return this.fakeValidation;
      if (typeof r === 'object' && !Array.isArray(r) && this.badges.every(b => b.badge !== r.badge || b.index !== r.index || b.subIndex !== r.subIndex)) return this.fakeValidation;
      if (
        typeof r === 'object' &&
        Array.isArray(r) &&
        r.some(t =>
          typeof t === 'string'
            ? this.badges.every(b => b.badge !== t || b.index !== undefined || b.subIndex !== undefined)
            : this.badges.every(b => b.badge !== t.badge || b.index !== t.index || b.subIndex !== t.subIndex)
        )
      )
        return this.fakeValidation;
    }
    return this;
  }
  if(validity: boolean | (() => boolean)): Validation<K> {
    if (this.isFake) return this.fakeValidation;
    if (typeof validity === 'function' ? validity() : validity) return this;
    this.ok = false;
    return this.fakeValidation;
  }
  do(task: () => void): Validation<K> {
    if (this.isFake) return this.fakeValidation;
    task();
    return this;
  }
  check(badge: K, validity: boolean | (() => boolean), message: string, index?: string | number, subIndex?: string | number): Validation<K> {
    if (this.isFake) return this.fakeValidation;
    if (typeof validity === 'function' ? validity() : validity) {
      this.badges.push({ badge, index, subIndex });
      return this;
    }
    this.ok = false;
    this.messages.push({ badge, index, subIndex, message });
    return this.fakeValidation;
  }

  throwIfErrorsExsit(): void {
    if (this.ok) return;
    if (this.messages.length) throw this.messages[0].message;
    throw 'Invalid API input data.';
  }
}
