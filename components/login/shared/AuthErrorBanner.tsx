interface AuthErrorBannerProps {
  message: string | null;
}

/** Server-error banner shared by the login and signup forms. */
export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-accent font-mono text-[0.65rem] uppercase tracking-wider">
      {message}
    </div>
  );
}

export default AuthErrorBanner;
