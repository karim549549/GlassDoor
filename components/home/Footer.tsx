import Link from "next/link";

/**
 * Site footer.
 *
 * Every internal link here points at a route that exists - the four standing
 * pages (about, support, terms, privacy) were created alongside this rather
 * than linked speculatively, because a footer full of 404s costs more trust
 * than a short footer does.
 *
 * The social links are placeholders and marked as such below: the accounts do
 * not exist yet, and pointing at someone else's handle by guessing the URL is
 * worse than pointing nowhere.
 */

const PRODUCT = [
  { label: "Browse arenas", href: "/arena" },
  { label: "Host an arena", href: "/arena/create" },
  { label: "Proof packets", href: "/proof" },
  { label: "Billboard", href: "/billboard" },
];

const AUDIENCE = [
  { label: "For companies", href: "/companies" },
  { label: "Hiring pipeline", href: "/recruiter" },
  { label: "Judging", href: "/judge" },
];

const COMPANY = [
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

/**
 * Placeholder until the accounts exist. Text rather than brand icons:
 * lucide-react v1 dropped GitHub, LinkedIn and X, and inventing SVGs for other
 * companies marks is not worth it for links that currently go nowhere.
 */
const SOCIAL = ["GitHub", "LinkedIn", "X", "Discord"];

function Column({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.24em] text-orange">
        {heading}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary text-foreground">
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 max-w-xs">
            <span className="font-display italic text-[1.6rem] uppercase leading-none">
              Devs Arena
            </span>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground leading-relaxed mt-4">
              Team coding challenges with a clock on them. Anyone can post a
              brief. Judged in the open by people who explain themselves.
            </p>
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground mt-5">
              Cairo, Egypt
            </p>
          </div>

          <Column heading="Product" links={PRODUCT} />
          <Column heading="Hiring" links={AUDIENCE} />
          <Column heading="Company" links={COMPANY} />
        </div>

        {/* Base line */}
        <div className="mt-14 border-t border-border pt-6 flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-5">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
            &copy; 2026 Devs Arena. Built, not claimed.
          </p>

          <div className="flex items-center gap-1">
            {SOCIAL.map((label) => (
              <a
                key={label}
                href="#"
                aria-label={label + " (coming soon)"}
                className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground hover:text-orange transition-colors px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
