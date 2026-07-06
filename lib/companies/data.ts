import type { Company } from "./types";

// TEMP: static mock data, no persistence yet. There is no Company/Salary/Comment
// Prisma model - this array is the entire "database" for the companies feature.
// Submitting a salary or comment in the UI does not write anywhere. Building real
// persistence for this feature was explicitly descoped from the auth/architecture
// refactor this file was touched in - see the refactor plan for context.
export const COMPANIES: Company[] = [
  { id: 1, name: "Vodafone Egypt", sector: "Telecom", rating: 3.4, reviews: 1240, roles: [
    { title: "Backend Engineer", exp: "2 yrs", min: 18000, max: 28000, median: 23000, submissions: 47 },
    { title: "Frontend Developer", exp: "2 yrs", min: 15000, max: 24000, median: 19500, submissions: 31 },
    { title: "DevOps Engineer", exp: "3 yrs", min: 22000, max: 32000, median: 27000, submissions: 18 },
    { title: "Data Analyst", exp: "1 yr", min: 12000, max: 18000, median: 15000, submissions: 24 },
  ]},
  { id: 2, name: "Raya Contact", sector: "BPO / Tech", rating: 2.8, reviews: 892, roles: [
    { title: "Backend Engineer", exp: "3 yrs", min: 22000, max: 30000, median: 26000, submissions: 38 },
    { title: "DevOps Engineer", exp: "2 yrs", min: 20000, max: 27000, median: 23500, submissions: 15 },
    { title: "QA Engineer", exp: "1 yr", min: 12000, max: 17000, median: 14500, submissions: 22 },
  ]},
  { id: 3, name: "Instabug", sector: "Product / SaaS", rating: 4.2, reviews: 310, roles: [
    { title: "Frontend Developer", exp: "2 yrs", min: 20000, max: 28000, median: 24000, submissions: 19 },
    { title: "Backend Engineer", exp: "3 yrs", min: 28000, max: 38000, median: 33000, submissions: 26 },
    { title: "Mobile Developer", exp: "2 yrs", min: 22000, max: 30000, median: 26000, submissions: 11 },
  ]},
  { id: 4, name: "Amazon Egypt", sector: "Big Tech", rating: 4.0, reviews: 215, roles: [
    { title: "SWE L4", exp: "4 yrs", min: 45000, max: 65000, median: 55000, submissions: 14 },
    { title: "SDE I", exp: "0-1 yr", min: 30000, max: 40000, median: 35000, submissions: 9 },
    { title: "Data Scientist", exp: "3 yrs", min: 38000, max: 55000, median: 46000, submissions: 7 },
  ]},
  { id: 5, name: "Paymob", sector: "Fintech", rating: 3.6, reviews: 441, roles: [
    { title: "Mobile Developer", exp: "2 yrs", min: 22000, max: 30000, median: 26000, submissions: 28 },
    { title: "Backend Engineer", exp: "1 yr", min: 18000, max: 24000, median: 21000, submissions: 34 },
    { title: "Frontend Developer", exp: "2 yrs", min: 17000, max: 23000, median: 20000, submissions: 19 },
  ]},
  { id: 6, name: "PwC Egypt", sector: "Consulting", rating: 3.1, reviews: 678, roles: [
    { title: "BI Developer", exp: "3 yrs", min: 18000, max: 24000, median: 21000, submissions: 33 },
    { title: "Tech Analyst", exp: "1 yr", min: 12000, max: 16000, median: 14000, submissions: 41 },
    { title: "Data Engineer", exp: "2 yrs", min: 16000, max: 22000, median: 19000, submissions: 17 },
  ]},
  { id: 7, name: "Fawry", sector: "Fintech", rating: 3.3, reviews: 523, roles: [
    { title: "Backend Engineer", exp: "2 yrs", min: 18000, max: 26000, median: 22000, submissions: 41 },
    { title: "QA Engineer", exp: "2 yrs", min: 13000, max: 18000, median: 15500, submissions: 26 },
    { title: "Mobile Developer", exp: "3 yrs", min: 22000, max: 30000, median: 26000, submissions: 14 },
  ]},
  { id: 8, name: "Swvl", sector: "Transport Tech", rating: 3.8, reviews: 189, roles: [
    { title: "Backend Engineer", exp: "3 yrs", min: 30000, max: 42000, median: 36000, submissions: 12 },
    { title: "Frontend Developer", exp: "2 yrs", min: 24000, max: 32000, median: 28000, submissions: 8 },
  ]},
  { id: 9, name: "Orange Egypt", sector: "Telecom", rating: 3.2, reviews: 891, roles: [
    { title: "Backend Engineer", exp: "2 yrs", min: 16000, max: 24000, median: 20000, submissions: 39 },
    { title: "Network Engineer", exp: "3 yrs", min: 18000, max: 26000, median: 22000, submissions: 28 },
  ]},
  { id: 10, name: "Breadfast", sector: "E-commerce", rating: 3.9, reviews: 234, roles: [
    { title: "Backend Engineer", exp: "2 yrs", min: 20000, max: 28000, median: 24000, submissions: 21 },
    { title: "Frontend Developer", exp: "1 yr", min: 16000, max: 22000, median: 19000, submissions: 13 },
  ]},
];
