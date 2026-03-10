const PIN_HASH_KEY = "zerith-pin-hash";
const SEED_KEY_PREFIX = "zerith-seed-";
const LAST_ACTIVE_KEY = "zerith-last-active";
export const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "zerith-pin-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function setPin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
  updateActivity();
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_HASH_KEY);
  if (!stored) return false;
  const hash = await hashPin(pin);
  return hash === stored;
}

export function isPinSet(): boolean {
  return !!localStorage.getItem(PIN_HASH_KEY);
}

export function clearPin(): void {
  localStorage.removeItem(PIN_HASH_KEY);
}

export function saveSeedPhrase(address: string, phrase: string): void {
  localStorage.setItem(SEED_KEY_PREFIX + address, phrase);
}

export function getSeedPhrase(address: string): string | null {
  return localStorage.getItem(SEED_KEY_PREFIX + address);
}

export function updateActivity(): void {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

export function isSessionExpired(): boolean {
  if (!isPinSet()) return false;
  const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!lastActive) return true;
  return Date.now() - parseInt(lastActive) > LOCK_TIMEOUT_MS;
}
