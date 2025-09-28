import { useState, useEffect } from 'react';
import type { Controls } from '../types';

export const useInput = (): Controls => {
  const [input, setInput] = useState<Controls>({
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
  });

  const keys: Record<string, keyof Controls> = {
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
    Space: 'fire',
  };

  const findKey = (key: string): keyof Controls | undefined => keys[key];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = findKey(e.code);
      if (key) {
        e.preventDefault();
        setInput((prev) => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = findKey(e.code);
      if (key) {
        e.preventDefault();
        setInput((prev) => ({ ...prev, [key]: false }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return input;
};
