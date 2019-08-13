import { useRef } from 'react';

export default function useProperty<T>(initialValue: T | (() => T)): (value?: T) => T {
  const ref = useRef<T>(typeof initialValue === 'function' ? (initialValue as (() => T))() : initialValue);
  return function(value?: T): T {
    if (arguments.length === 0) return ref.current;
    return (ref.current = value!);
  };
}
