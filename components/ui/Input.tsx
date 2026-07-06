import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          className={`w-full bg-secondary border border-border px-3 py-2 text-sm font-sans placeholder-muted-foreground/60 focus:outline-none focus:border-foreground/45 transition-colors duration-200 ${
            error ? "border-accent focus:border-accent" : ""
          } ${className || ""}`}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="font-mono text-[0.6rem] text-accent mt-0.5 tracking-wide">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
