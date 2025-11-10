import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "app_jwt_token";

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
      return;
    } catch {
      // ignore storage errors on web
    }
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore storage errors on web
    }
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return Boolean(token);
}
