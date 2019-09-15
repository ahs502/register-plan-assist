import DeepWritablePartial from '@core/types/DeepWritablePartial';

export default interface ModelConvertable<M> {
  extractModel(overrides?: DeepWritablePartial<M>): M;
}

export function getOverrided<T>(value: T, overrides: any, ...path: (string | number)[]): T {
  if (!overrides) return value;
  while (path.length) {
    if (!(path[0] in overrides)) return value;
    overrides = overrides[path.shift()!];
  }
  return overrides;
}

export function getOverridedObject<M>(value: ModelConvertable<M>, overrides: any, ...path: (string | number)[]): M {
  if (!overrides) return value.extractModel();
  while (path.length) {
    if (!(path[0] in overrides)) return value.extractModel();
    overrides = overrides[path.shift()!];
  }
  return value.extractModel(overrides);
}

export function getOverridedArray<M>(array: readonly ModelConvertable<M>[], overrides: any, ...path: (string | number)[]): M[] {
  if (!overrides) return array.map(item => item.extractModel());
  while (path.length) {
    if (!(path[0] in overrides)) return array.map(item => item.extractModel());
    overrides = overrides[path.shift()!];
  }
  if (!overrides) return array.map(item => item.extractModel());
  const overridingKeys = Object.keys(overrides);
  const keys = Object.keys(array);
  const result: M[] = [];
  keys.forEach(key => (result[key as any] = overridingKeys.includes(key) ? overrides[key] && array[key as any].extractModel(overrides[key]) : array[key as any].extractModel()));
  overridingKeys.forEach(key => keys.includes(key) || (result[key as any] = overrides[key]));
  return result.filter(Boolean);
}
