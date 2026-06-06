import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export async function readLocalJson<T>(
  key: string,
  fallback: T
): Promise<T> {
  try {
    const raw =
      Platform.OS === "web"
        ? globalThis.localStorage?.getItem(key)
        : await AsyncStorage.getItem(key);

    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeLocalJson<T>(key: string, value: T): Promise<void> {
  const raw = JSON.stringify(value);

  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(key, raw);
    return;
  }

  await AsyncStorage.setItem(key, raw);
}

export async function deleteLocalJson(key: string): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await AsyncStorage.removeItem(key);
}
