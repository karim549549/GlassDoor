/**
 * The dark editorial column beside every auth form.
 *
 * Shared by the standalone /login, /signup and /forgot-password pages and by
 * the in-context modal, so the two never drift - it used to live inline in
 * AuthModal, which is why the pages could not have looked like it.
 */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden min-h-[500px] select-none flex-col justify-between overflow-hidden bg-[#0E0E0D] p-12 text-[#F1EFE9] lg:flex">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-brand-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#F1EFE9" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-brand-grid)" />
        </svg>
      </div>

      <div className="z-10 flex h-full flex-col justify-between">
        <div>
          <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.2em] text-orange">
            Devs Arena
          </span>
          <h2 className="mt-12 font-display text-[2.4rem] font-medium italic leading-tight">
            Pick a brief.<br />
            Grab a team.<br />
            Four hours on the clock.
          </h2>
        </div>

        <div className="mt-auto font-mono text-[0.55rem] uppercase tracking-wider opacity-40">
          Devs Arena © 2026 · Free to enter, always
        </div>
      </div>
    </div>
  );
}

export default AuthBrandPanel;
