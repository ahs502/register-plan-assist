import { useState } from 'react';

export function useForceRender(): () => void {
  const [bit, setBit] = useState(false);
  return () => setBit(!bit);
}
