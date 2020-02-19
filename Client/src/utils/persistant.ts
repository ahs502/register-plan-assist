import UserModel from '@core/models/UserModel';
import UserSettingsModel from '@core/models/authentication/UserSettingsModel';
import RpaUserSettingModel from '@core/models/RpaUserSettingModel';

export interface Persistant {
  /** The provided code from ADFS server when redirecting from the login page. */
  oauthCode?: string;

  /** The provided refresh token for this login. */
  refreshToken?: string;

  /** The current user. */
  user?: UserModel;

  /** The current user settings. */
  userSettings?: UserSettingsModel;

  /** The current user setting in rpa */
  rpaUserSetting?: RpaUserSettingModel;

  /** The content of Authentication header for restricted requests to /api provided by the server. */
  encodedAuthenticationHeader?: string;
}

type PersistantStatus = { [key in keyof Persistant]?: boolean };

/**
 * The *only standard* way to access **localStorage** in this application.
 *
 * The supported actions for any valid `key` are:
 *
 * + **`persistant.key`** in order to read `key` from `localStorage` _(returns `undefined` for non existing `key`s)_,
 * + **`persistant.key = value`** in order to write `value` for `key` in `localStorage`,
 * + **`delete persistant.key`** or **`persistant.key = undefined`** in order to remove `key` from `localStorage`.
 */
const persistant: Persistant = new Proxy(
  {
    cache: {} as Persistant,
    /**
     * `true`: exists and cached, `false`: does not exist, `undefined`: unknown.
     */
    status: {} as PersistantStatus
  },
  {
    get({ cache, status }, property, receiver) {
      return get(cache, status, property as any);
    },
    set({ cache, status }, property, value, receiver): boolean {
      set(cache, status, property as any, value);
      return true;
    },
    deleteProperty({ cache, status }, property): boolean {
      set(cache, status, property as any, undefined);
      return true;
    }
  }
) as any;

function get<T extends keyof Persistant>(cache: Persistant, status: PersistantStatus, key: T): Persistant[T] {
  if (status[key] === true) return cache[key];
  if (status[key] === false) return undefined;
  const stringValue = localStorage.getItem(key);
  if (!(status[key] = stringValue !== null)) return undefined;
  return (cache[key] = JSON.parse(stringValue!));
}
function set<T extends keyof Persistant>(cache: Persistant, status: PersistantStatus, key: T, value: Persistant[T] | undefined): void {
  cache[key] = value;
  (status[key] = value !== undefined) ? localStorage.setItem(key, JSON.stringify(value)) : localStorage.removeItem(key);
}

export default persistant;
