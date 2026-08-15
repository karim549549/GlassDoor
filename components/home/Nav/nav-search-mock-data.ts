// Mock data as requested (no backend yet)

export interface MockUser {
  id: string;
  name: string;
  handle: string;
  email: string;
}

export interface MockCompany {
  id: number;
  name: string;
  sector: string;
}

export interface MockContextEntry {
  id: string;
  title: string;
  description: string;
  url: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: "usr1", name: "Anwar Moustafa", handle: "anwar_m", email: "anwar@devsarena.com" },
  { id: "usr2", name: "Karim Hassan", handle: "karim_h", email: "karim@devsarena.com" },
  { id: "usr3", name: "Moustafa Ali", handle: "moustafa_a", email: "moustafa@devsarena.com" },
  { id: "usr4", name: "Salma Mahmoud", handle: "salma_m", email: "salma@devsarena.com" },
  { id: "usr5", name: "Hassan Ibrahim", handle: "hassan_i", email: "hassan@devsarena.com" },
];

export const MOCK_COMPANIES: MockCompany[] = [
  { id: 1, name: "Vodafone Egypt", sector: "Telecom" },
  { id: 2, name: "Raya Contact", sector: "BPO / Tech" },
  { id: 3, name: "Instabug", sector: "Product / SaaS" },
  { id: 4, name: "Amazon Egypt", sector: "Big Tech" },
  { id: 5, name: "Paymob", sector: "Fintech" },
  { id: 6, name: "Swvl", sector: "Transport Tech" },
];

export const MOCK_CONTEXT: MockContextEntry[] = [
  { id: "rules", title: "Community Guidelines & Rules", description: "Conduct, eligibility, and arena participation rules.", url: "/context" },
  { id: "spec", title: "Rating & Judging Methodology", description: "How rubric scores and Glicko-2 ratings are calculated.", url: "/context" },
  { id: "privacy", title: "Anonymity & Privacy Policy", description: "How we protect developer identity.", url: "/context" },
];
