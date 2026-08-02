export interface ArenaCardData {
  id: string;
  tag: string;
  title: string;
  description: string;
  tech: string[];
  timeLabel: string;
  timeValue: string;
  isLive: boolean;
}

export const ARENA_CARDS: ArenaCardData[] = [
  // Card 3 (Bottom card in stack, index 0 in render to layer below)
  {
    id: "card-database",
    tag: "Database Speedrun",
    title: "MIGRATE 10M RECORDS LIVE",
    description: "Optimize migration scripts to sync a database with zero downtime under load.",
    tech: ["POSTGRES", "PYTHON", "PRISMA"],
    timeLabel: "STARTS IN",
    timeValue: "3 DAYS",
    isLive: false,
  },
  // Card 2 (Middle card in stack, index 1 in render to layer middle)
  {
    id: "card-devops",
    tag: "DevOps Sprint",
    title: "SCALE WEBSOCKET CLUSTER TO 10K",
    description: "Deploy and load-test a distributed messaging server with high availability.",
    tech: ["REDIS", "GO", "DOCKER"],
    timeLabel: "STARTS IN",
    timeValue: "24 HOURS",
    isLive: false,
  },
  // Card 1 (Top card in stack, index 2 in render to layer on top)
  {
    id: "card-frontend",
    tag: "Arena Challenge",
    title: "BUILD A REAL-TIME DEVELOPER MAP",
    description: "Create an interactive map tracking live developer profiles and statuses during a 6-hour sprint.",
    tech: ["REACT", "NODE.JS", "WEBSOCKETS"],
    timeLabel: "TIME REGISTRY",
    timeValue: "05:12:43", // Will update dynamically for this active card
    isLive: true,
  },
];
