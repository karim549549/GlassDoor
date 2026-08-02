export interface NavLinkEntry {
  label: string;
  href: string;
}

// Shared between the desktop NavTabs and the BurgerMenu's mobile drawer so
// the primary navigation destinations only need to be listed once.
export const NAV_LINKS: NavLinkEntry[] = [
  { label: "Companies", href: "/" },
  { label: "Reviews", href: "/" },
  { label: "Arenas", href: "/arena" },
];
