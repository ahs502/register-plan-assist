export type ServerResult<T = any> = { message?: string; value?: T };

export default class Validation<K extends string> {
  ok = true;
  messages: { [key in K]?: string } = {};
  badges: string[] = [];

  check(badge: string, requiredBadges: string[], validityCheck: () => boolean, key: K, message: string): void {
    if (requiredBadges.find(b => !this.badges.includes(b))) return;
    validityCheck() ? this.badges.push(badge) : ((this.ok = false), (this.messages[key] = message));
  }
  throwIfErrorsExsit(): void {
    if (!this.ok) throw Object.values(this.messages).find(Boolean);
  }
}
