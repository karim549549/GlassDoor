// v2: the previous key stored a Supabase refresh token per account, which made
// any XSS on this origin a permanent account takeover. Tokens are no longer
// sent to the browser at all (see app/api/auth/*). This key holds only the
// email and display name needed to prefill the login form.
const STORAGE_KEY = "devs_arena_saved_users_v2";
const LEGACY_STORAGE_KEY = "devs_arena_saved_users";

export interface SavedAccount {
  email: string;
  name: string;
}

/**
 * Deletes the pre-v2 blob, which may still hold refresh tokens in browsers that
 * signed in before this key was versioned. Ignoring the old key would leave
 * those tokens readable by any script on the origin indefinitely.
 */
function purgeLegacyStorage() {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to purge legacy saved accounts", e);
  }
}

/**
 * localStorage is attacker-writable, so the parsed blob is treated as untrusted
 * input and mapped field by field - anything else it carries (a leftover
 * refreshToken, say) is dropped here rather than round-tripped by the next
 * upsert.
 */
function toSavedAccounts(parsed: unknown): SavedAccount[] {
  if (!Array.isArray(parsed)) return [];

  return parsed.reduce<SavedAccount[]>((accounts, entry) => {
    if (typeof entry !== "object" || entry === null) return accounts;

    const { email, name } = entry as { email?: unknown; name?: unknown };
    if (typeof email !== "string" || email.length === 0) return accounts;

    accounts.push({
      email,
      name: typeof name === "string" ? name : email.split("@")[0],
    });
    return accounts;
  }, []);
}

export function getSavedAccounts(): SavedAccount[] {
  purgeLegacyStorage();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? toSavedAccounts(JSON.parse(stored)) : [];
  } catch (e) {
    console.error("Failed to load saved accounts", e);
    return [];
  }
}

function setSavedAccounts(accounts: SavedAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error("Failed to save accounts", e);
  }
}

export function upsertSavedAccount(account: SavedAccount) {
  const accounts = getSavedAccounts();
  const index = accounts.findIndex(
    (acc) => acc.email.toLowerCase() === account.email.toLowerCase()
  );

  if (index > -1) {
    accounts[index] = { ...accounts[index], ...account };
  } else {
    accounts.push(account);
  }
  setSavedAccounts(accounts);
}

export function removeSavedAccount(email: string) {
  const accounts = getSavedAccounts().filter(
    (acc) => acc.email.toLowerCase() !== email.toLowerCase()
  );
  setSavedAccounts(accounts);
}
