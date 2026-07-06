"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "@/components/login/LoginForm";
import SignupForm from "@/components/signup/SignupForm";

export function AuthModal() {
  const pathname = usePathname();
  const router = useRouter();

  const isOpen = pathname === "/login" || pathname === "/signup";
  const isLogin = pathname === "/login";

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push("/");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[450px] p-8 bg-[#F1EFE9] border-2 border-foreground shadow-2xl rounded-none !gap-0">
        {isLogin ? <LoginForm /> : <SignupForm />}
      </DialogContent>
    </Dialog>
  );
}
export default AuthModal;
