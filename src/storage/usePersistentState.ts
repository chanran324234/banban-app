import { useEffect, useRef, useState } from "react";
import { readLocalJson, writeLocalJson } from "./localDataStore";

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    readLocalJson(key, initialValue)
      .then((storedValue) => {
        setValue(storedValue);
        hasLoaded.current = true;
      })
      .finally(() => setIsLoaded(true));
  }, [initialValue, key]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    writeLocalJson(key, value).catch(() => undefined);
  }, [key, value]);

  return [value, setValue, isLoaded] as const;
}
