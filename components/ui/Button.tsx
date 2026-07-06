import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "accent";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", isLoading, disabled, ...props }, ref) => {
    let baseStyles =
      "font-mono text-[0.7rem] uppercase tracking-wider px-4 py-2.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed";

    let variantStyles = "";
    switch (variant) {
      case "primary":
        variantStyles =
          "bg-foreground text-background border-foreground hover:bg-background hover:text-foreground";
        break;
      case "secondary":
        variantStyles =
          "bg-secondary text-foreground border-border hover:border-foreground";
        break;
      case "outline":
        variantStyles =
          "bg-transparent text-foreground border-border hover:bg-foreground hover:text-background hover:border-foreground";
        break;
      case "accent":
        variantStyles =
          "bg-accent text-accent-foreground border-accent hover:bg-transparent hover:text-accent";
        break;
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles} ${className || ""}`}
        {...props}
      >
        {isLoading ? (
          <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
