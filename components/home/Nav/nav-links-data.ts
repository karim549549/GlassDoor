export interface NavLinkEntry {
  label: string;
  href: string;
}

// Shared between the desktop NavTabs and the BurgerMenu's mobile drawer so
// the primary navigation destinations only need to be listed once.
/**
 * Entrant-facing only.
 *
 * "For companies" was here and has moved to the footer. It is the pitch for the
 * side of the business that is not yet for sale, and the nav is the most
 * valuable space on the site - see PRD 1.2. The page still exists, still works,
 * and is still linked and crawlable; it just no longer greets a developer
 * arriving to find something to build.
 */
export const NAV_LINKS: NavLinkEntry[] = [
  { label: "Challenges", href: "/arena" },
  { label: "Start one", href: "/arena/create" },
];

/**
 * "Reviews" was removed rather than repointed. It also pointed at "/", and it
 * is a leftover from the salary-transparency product this repo was before the
 * pivot: there is no review model, no review page and nothing to review. A nav
 * item promising a section that does not exist costs more than the space it
 * occupies.
 */
