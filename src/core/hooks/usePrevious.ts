import { useRef } from 'react';

export function usePrevious<T = unknown>(value: T) {
  const currentRef = useRef<T>(value);
  const previousRef = useRef<T>();

  if (currentRef.current !== value) {
    previousRef.current = currentRef.current;
    currentRef.current = value;
  }

  return previousRef.current;
}
