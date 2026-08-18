"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/login/LoginForm";
import AccountSwitcher from "@/components/login/AccountSwitcher";
import { getSavedAccounts } from "@/lib/client/saved-accounts";

/**
 * Sign-in, including the "pick a saved account" step in front of it.
 *
 * This logic sat inline in AuthModal, which meant a real /login page could not
 * reuse it. Both surfaces render this now.
 */
export function LoginPanel() {
  const router = useRouter();
  const [forceCredentials, setForceCredentials] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState<string | undefined>(undefined);

  // Saved accounts live in localStorage, so this is a client-only lookup read
  // during render rather than synced in from an effect. Both callers mount
  // this below a client boundary that is never server-rendered, so there is
  // nothing to hydrate against and no second render pass to pay for.
  const hasAccounts = typeof window !== "undefined" && getSavedAccounts().length > 0;

  if (hasAccounts && !forceCredentials) {
    return (
      <AccountSwitcher
        onSelectAccount={(email) => {
          setPrefilledEmail(email);
          setForceCredentials(true);
        }}
        onUseAnother={() => {
          setPrefilledEmail(undefined);
          setForceCredentials(true);
        }}
        onCreateAccount={() => router.push("/signup")}
      />
    );
  }

  return (
    <LoginForm
      prefilledEmail={prefilledEmail}
      onBackToSwitcher={
        hasAccounts
          ? () => {
              setForceCredentials(false);
              setPrefilledEmail(undefined);
            }
          : undefined
      }
    />
  );
}

export default LoginPanel;
