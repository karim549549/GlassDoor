"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remember: boolean) => void;
}

export function LogoutConfirmDialog({ isOpen, onOpenChange, onConfirm }: LogoutConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8 bg-[#F1EFE9] border border-[#0E0E0D] rounded-none shadow-2xl font-mono text-[0.65rem] uppercase tracking-wider text-[#0E0E0D] z-50">
        <div className="space-y-4">
          <h3 className="font-display text-[1.2rem] italic lowercase first-letter:uppercase font-bold tracking-tight text-[#0E0E0D]">
            Remember this account?
          </h3>
          <p className="font-sans text-[0.7rem] text-muted-foreground leading-normal lowercase first-letter:uppercase">
            Would you like to keep your account saved on this device for instant one-click login next time?
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onConfirm(true)}
              className="py-2 border border-[#0E0E0D] bg-[#0E0E0D] text-[#F1EFE9] font-bold hover:bg-[#F1EFE9] hover:text-[#0E0E0D] transition-colors cursor-pointer text-center"
            >
              Yes, Remember
            </button>
            <button
              onClick={() => onConfirm(false)}
              className="py-2 border border-[#0E0E0D] bg-transparent text-[#0E0E0D] font-bold hover:bg-[#0E0E0D] hover:text-[#F1EFE9] transition-colors cursor-pointer text-center"
            >
              No, Forget
            </button>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-full text-center mt-2 font-mono text-[0.55rem] text-muted-foreground hover:text-foreground hover:underline cursor-pointer bg-transparent border-none py-1"
          >
            Cancel Logout
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LogoutConfirmDialog;
