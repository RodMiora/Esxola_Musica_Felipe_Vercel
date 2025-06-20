import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          setValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Erro ao carregar ${key} do localStorage:`, error);
      }
      setIsLoaded(true);
    }
  }, [key]);

  const setStoredValue = (newValue: T) => {
    if (typeof window !== 'undefined') {
      try {
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error);
      }
    }
  };

  return [value, setStoredValue, isLoaded] as const;
}