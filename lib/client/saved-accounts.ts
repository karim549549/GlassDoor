const STORAGE_KEY = "devs_arena_saved_users";

export interface SavedAccount {
  email: string;
  name: string;
  refreshToken?: string | null;
}

// NOTE: refreshToken is stored client-side in localStorage to power the
// "saved accounts" quick-switch feature. This is accepted short-term debt -
// a refresh token readable by any XSS on the page outlives the httpOnly
// session cookie Supabase already manages. Moving this server-side is a
// separate follow-up task, not part of this refactor.

export function getSavedAccounts(): SavedAccount[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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
