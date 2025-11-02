declare module "expo-secure-store" {
  export const AFTER_FIRST_UNLOCK: string;
  export const ALWAYS: string;
  export const WHEN_UNLOCKED: string;
  export function getItemAsync(key: string): Promise<string | null>;
  export function setItemAsync(
    key: string,
    value: string,
    options?: { keychainAccessible?: string }
  ): Promise<void>;
  export function deleteItemAsync(key: string): Promise<void>;
}
