"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary whose only job is to defer AuthModal.
 *
 * AuthModal pulls in five form subtrees - login, signup, account switcher,
 * forgot-password and change-password - for a dialog that opens only when the
 * URL carries an `action` parameter. Statically imported it shipped to every
 * homepage visitor, most of whom never open it.
 *
 * The wrapper exists because `next/dynamic` with `ssr: false` is not allowed
 * inside a Server Component, and app/page.tsx is one. Keeping the boundary this
 * thin means nothing else is dragged across it.
 */
const AuthModal = dynamic(
  () => import("./AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);

export function AuthModalMount() {
  return <AuthModal />;
}

export default AuthModalMount;
