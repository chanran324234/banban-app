import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const deepseekKeyName = "banban.deepseek.apiKey";

export async function getDeepSeekApiKey(): Promise<string | null> {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(deepseekKeyName) ?? null;
  }

  return SecureStore.getItemAsync(deepseekKeyName);
}

export async function saveDeepSeekApiKey(apiKey: string): Promise<void> {
  const normalized = apiKey.trim();

  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(deepseekKeyName, normalized);
    return;
  }

  await SecureStore.setItemAsync(deepseekKeyName, normalized);
}

export async function deleteDeepSeekApiKey(): Promise<void> {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(deepseekKeyName);
    return;
  }

  await SecureStore.deleteItemAsync(deepseekKeyName);
}
