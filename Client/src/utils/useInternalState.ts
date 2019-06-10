import { useRef } from 'react';

export default function useInternalState<T>(initialValue: T | (() => T)): [T, (value: T) => void] {
  const ref = useRef<T>(typeof initialValue === 'function' ? (initialValue as (() => T))() : initialValue);
  return [
    ref.current as T,
    (value: T) => {
      ref.current = value;
    }
  ];
}
