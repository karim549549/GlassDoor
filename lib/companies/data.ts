export interface SeedCompany {
  name: string;
  domain: string;
  industry:
    | "FINTECH"
    | "ARTIFICIAL_INTELLIGENCE"
    | "HEALTH_TECH"
    | "E_COMMERCE"
    | "ED_TECH"
    | "LOGISTICS_SUPPLY_CHAIN"
    | "CYBERSECURITY"
    | "DEVELOPER_TOOLS"
    | "GAMING_ENTERTAINMENT"
    | "ENTERPRISE_SAAS"
    | "TELECOMMUNICATIONS"
    | "GREEN_TECH"
    | "OTHER";
  techStack: string[];
  governorate: string;
}

export const COMPANIES: SeedCompany[] = [
  {
    name: "Vodafone Egypt",
    domain: "vodafone.com.eg",
    industry: "TELECOMMUNICATIONS",
    techStack: ["Java", "Spring Boot", "React", "Docker", "Kubernetes"],
    governorate: "Giza",
  },
  {
    name: "Paymob",
    domain: "paymob.com",
    industry: "FINTECH",
    techStack: ["Python", "Django", "PostgreSQL", "React", "AWS"],
    governorate: "Cairo",
  },
  {
    name: "Instabug",
    domain: "instabug.com",
    industry: "DEVELOPER_TOOLS",
    techStack: ["Go", "Node.js", "React", "Kubernetes", "Redis"],
    governorate: "Cairo",
  },
  {
    name: "Swvl",
    domain: "swvl.com",
    industry: "LOGISTICS_SUPPLY_CHAIN",
    techStack: ["Node.js", "TypeScript", "Kotlin", "Kafka", "AWS"],
    governorate: "Cairo",
  },
  {
    name: "MaxAB",
    domain: "maxab.io",
    industry: "E_COMMERCE",
    techStack: ["Python", "React Native", "PostgreSQL", "GCP"],
    governorate: "Cairo",
  },
];
