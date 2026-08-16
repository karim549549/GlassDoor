export interface NavLinkEntry {
  label: string;
  href: string;
}

// Shared between the desktop NavTabs and the BurgerMenu's mobile drawer so
// the primary navigation destinations only need to be listed once.
export const NAV_LINKS: NavLinkEntry[] = [
  { label: "Arenas", href: "/arena" },
  // Was href "/" - it pointed at the homepage from every page, including the
  // homepage itself. Now goes to the employer page it names.
  { label: "For companies", href: "/companies" },
];

/**
 * "Reviews" was removed rather than repointed. It also pointed at "/", and it
 * is a leftover from the salary-transparency product this repo was before the
 * pivot: there is no review model, no review page and nothing to review. A nav
 * item promising a section that does not exist costs more than the space it
 * occupies.
 */
