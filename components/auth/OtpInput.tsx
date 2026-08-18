"use client";

import React, { useId, useRef, useState } from "react";
import { OTP_LENGTH } from "@/lib/auth/otp";

interface OtpInputProps {
  value: string;
  onChange: (next: string) => void;
  /** Fired once the last digit lands, so the form can submit without a click. */
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
  describedBy?: string;
}

/**
 * Six boxes, one input.
 *
 * The obvious build - six separate <input maxLength={1}> - is where this kind
 * of component usually goes wrong: every one of paste, backspace-across-boxes,
 * arrow keys, mobile autofill and screen-reader announcement has to be
 * hand-reimplemented, and the value can develop holes in the middle when a
 * digit is cleared. Here the value is a single string in a single real input
 * that happens to be invisible, and the boxes are decoration painted from it.
 * Paste, autofill, undo and selection are then the browser's own behaviour.
 *
 * `autoComplete="one-time-code"` is the whole point on a phone: iOS and
 * Android surface the code from the mail notification as a keyboard
 * suggestion, so the reader never opens their mail app at all.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  label = "Verification code",
  describedBy,
}: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const inputId = useId();

  const digits = value.split("");
  // The caret sits on the first empty box, or rests on the last one when full.
  const activeIndex = Math.min(digits.length, OTP_LENGTH - 1);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(next);
    if (next.length === OTP_LENGTH) onComplete?.(next);
  };

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>

      <div
        className="relative mt-2"
        // Clicking anywhere in the strip should land the caret, including the
        // gaps between boxes, which the input itself does not cover.
        onMouseDown={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          value={value}
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true);
            // Always type at the end - an arbitrary caret position inside a
            // code makes the highlighted box lie about where input will go.
            const end = e.currentTarget.value.length;
            e.currentTarget.setSelectionRange(end, end);
          }}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoCorrect="off"
          spellCheck={false}
          maxLength={OTP_LENGTH}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
        />

        {/* Painted from the input's value. aria-hidden because the input above
            already carries the label, the value and the invalid state - a
            screen reader announcing six empty boxes on top of that is noise. */}
        <div aria-hidden className="flex gap-2 sm:gap-2.5">
          {Array.from({ length: OTP_LENGTH }).map((_, i) => {
            const char = digits[i] ?? "";
            const isActive = focused && i === activeIndex && !disabled;

            return (
              <div
                key={i}
                className={[
                  "flex h-14 flex-1 items-center justify-center border bg-secondary",
                  "font-mono text-xl tabular-nums text-foreground transition-colors duration-150",
                  invalid
                    ? "border-accent"
                    : isActive
                      ? "border-orange"
                      : char
                        ? "border-foreground/45"
                        : "border-border",
                  disabled ? "opacity-50" : "",
                ].join(" ")}
              >
                {char || (
                  <span
                    className={
                      isActive
                        ? "block h-6 w-px animate-pulse bg-orange"
                        : "block h-px w-3 bg-muted-foreground/40"
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OtpInput;
