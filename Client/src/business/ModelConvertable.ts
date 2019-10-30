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
  const overridingIndexes = Object.keys(overrides);
  const originalIndexes = Object.keys(array);
  const result: M[] = [];
  overridingIndexes.forEach(index => (result[index as any] = originalIndexes.includes(index) ? array[index as any].extractModel(overrides[index]) : overrides[index]));
  return result.filter(Boolean);
}
