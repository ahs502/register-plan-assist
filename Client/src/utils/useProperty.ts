import { useRef } from 'react';

interface Ref<T> {
  initiated: boolean;
  value: T;
}

export default function useProperty<T = any>(initialValue: T | (() => T)): (value?: T | ((old: T) => T)) => T {
  const ref = useRef<Ref<T>>({ initiated: false, value: undefined as any });
  if (!ref.current.initiated) {
    ref.current.value = typeof initialValue === 'function' ? (initialValue as (() => T))() : initialValue;
    ref.current.initiated = true;
  }
  return function(value?: T | ((old: T) => T)): T {
    if (arguments.length === 0) return ref.current.value;
    return (ref.current.value = typeof value === 'function' ? (value as ((old: T) => T))(ref.current.value) : (value as T));
  };
}
