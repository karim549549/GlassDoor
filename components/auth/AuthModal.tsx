"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ChangePasswordForm from "@/components/login/ChangePasswordForm";
import { AuthBrandPanel } from "./AuthBrandPanel";

/**
 * The recovery dialog, and only that.
 *
 * This used to be the whole auth surface: /login, /signup and
 * /forgot-password were rewrites onto "/" in next.config.ts, and this read the
 * pathname to decide which of five forms to show. All three are real pages
 * now, so the only thing left that legitimately arrives as an overlay is
 * `?action=reset-password` - the landing spot for a recovery link mailed
 * before the templates switched to codes, handed here by
 * /api/auth/callback once it has exchanged the code for a session.
 *
 * Closing removes the parameter rather than pushing "/", so a reader who
 * dismisses it stays where they were.
 */
export function AuthModal() {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.replace(window.location.pathname);
      }}
    >
      <DialogContent
        showCloseButton
        className="grid w-full max-w-[calc(100%-2rem)] grid-cols-1 overflow-hidden rounded-none border-0 p-0 shadow-2xl lg:max-w-4xl lg:grid-cols-2 !gap-0"
      >
        <AuthBrandPanel />
        <div className="col-span-1 flex min-h-[500px] flex-col justify-center bg-[#F1EFE9] p-8 md:p-12">
          <ChangePasswordForm onSuccess={() => router.replace(window.location.pathname)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
