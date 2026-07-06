"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "@/components/login/LoginForm";
import SignupForm from "@/components/signup/SignupForm";
import AccountSwitcher from "@/components/login/AccountSwitcher";
import ForgotPasswordForm from "@/components/login/ForgotPasswordForm";
import ChangePasswordForm from "@/components/login/ChangePasswordForm";

export function AuthModal() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const action = searchParams.get("action");

  // Determine active view from URL path and search params
  const isResetPassword = action === "reset-password";
  const isForgotPassword = pathname === "/forgot-password";
  const isSignup = pathname === "/signup";
  const isLogin = pathname === "/login";

  const isOpen = isLogin || isSignup || isForgotPassword || isResetPassword;

  // Local state for account switcher vs credentials login
  const [forceLoginView, setForceLoginView] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState<string | undefined>(undefined);
  const [hasAccounts, setHasAccounts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem("sherh_saved_users");
        if (stored) {
          const accounts = JSON.parse(stored);
          setHasAccounts(accounts.length > 0);
        } else {
          setHasAccounts(false);
        }
      } catch {
        setHasAccounts(false);
      }
    }
  }, [isOpen, pathname]);

  // Clean up states when modal closes or routes change
  useEffect(() => {
    if (!isOpen) {
      setForceLoginView(false);
      setPrefilledEmail(undefined);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push("/");
    }
  };

  const handleSelectAccount = (email: string) => {
    setPrefilledEmail(email);
    setForceLoginView(true);
  };

  const handleSuccessChangePassword = () => {
    router.push("/");
  };

  const renderForm = () => {
    if (isResetPassword) {
      return <ChangePasswordForm onSuccess={handleSuccessChangePassword} />;
    }

    if (isForgotPassword) {
      return <ForgotPasswordForm onBackToLogin={() => router.push("/login")} />;
    }

    if (isSignup) {
      return <SignupForm />;
    }

    if (isLogin) {
      // If we have saved accounts and aren't forcing the standard credentials form:
      if (hasAccounts && !forceLoginView) {
        return (
          <AccountSwitcher
            onSelectAccount={handleSelectAccount}
            onUseAnother={() => {
              setPrefilledEmail(undefined);
              setForceLoginView(true);
            }}
            onCreateAccount={() => router.push("/signup")}
          />
        );
      }

      // Otherwise, standard credentials login form:
      return (
        <LoginForm
          prefilledEmail={prefilledEmail}
          onBackToSwitcher={
            hasAccounts
              ? () => {
                  setForceLoginView(false);
                  setPrefilledEmail(undefined);
                }
              : undefined
          }
        />
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        showCloseButton={true}
        className="w-full max-w-[calc(100%-2rem)] lg:max-w-4xl p-0 overflow-hidden rounded-none border-0 shadow-2xl grid grid-cols-1 lg:grid-cols-2 !gap-0"
      >
        {/* Left Column - Dark Editorial Brand Sidebar */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0E0E0D] text-[#F1EFE9] relative overflow-hidden select-none min-h-[500px]">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="modal-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#F1EFE9" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#modal-grid)" />
            </svg>
          </div>

          <div className="z-10 flex flex-col justify-between h-full">
            <div>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-orange font-bold">
                Sherh شرح
              </span>
              <h3 className="font-display text-[2.4rem] leading-tight italic mt-12 font-medium">
                Real salaries.<br />
                Real reviews.<br />
                Every Egyptian tech company, indexed.
              </h3>
            </div>
            
            <div className="font-mono text-[0.55rem] tracking-wider opacity-40 uppercase mt-auto">
              Sherh Egypt © 2026 · Salary Transparency Project
            </div>
          </div>
        </div>

        {/* Right Column - Dynamic Forms Section */}
        <div className="col-span-1 p-8 md:p-12 flex flex-col justify-center bg-[#F1EFE9] min-h-[500px]">
          {renderForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default AuthModal;
