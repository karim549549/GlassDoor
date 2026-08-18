"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

/**
 * Loads the recovery dialog only when the URL actually asks for it.
 *
 * The gate is the point. Previously this rendered AuthModal unconditionally,
 * so every homepage visitor downloaded the dialog and its form subtrees for
 * something almost none of them would open. `next/dynamic` does not fetch a
 * chunk until the component renders, so returning null first means the cost is
 * paid only by someone arriving on a recovery link.
 *
 * The wrapper exists at all because `ssr: false` is not allowed inside a
 * Server Component and app/page.tsx is one.
 */
const AuthModal = dynamic(() => import("./AuthModal").then((m) => m.AuthModal), {
  ssr: false,
});

export function AuthModalMount() {
  const action = useSearchParams().get("action");
  if (action !== "reset-password") return null;
  return <AuthModal />;
}

export default AuthModalMount;
