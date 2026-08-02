import type { Comment } from "./types";

// TEMP: same situation as ./data.ts - this is mock seed data for the community feed
// since no Comment persistence exists yet. Posting a comment/reply in the UI only
// updates this list in local component state; nothing is written anywhere.
export const INITIAL_MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "Ahmed Aly",
    content: "Vodafone Egypt has been standardizing ranges for Mid-level developers. Good benefits overall but core salary increases don't match inflation.",
    date: "18 hours ago",
    role: "Backend Engineer",
    seniority: "Mid",
    ratings: { salary: 3, learning: 4, vibes: 4 },
    replies: [
      {
        id: "c1-r1",
        author: "Mohamed H.",
        content: "Agree, their tech stack is a bit legacy in some departments but the work life balance is great.",
        date: "12 hours ago",
        replies: [
          {
            id: "c1-r1-r1",
            author: "Sara Mansour",
            content: "Depends on the team, some teams are working on modern cloud migrations and offer hybrid flexibility.",
            date: "6 hours ago",
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    author: "Tarek Fahmy",
    content: "Had a senior backend engineer interview recently. The technical assessment process was smooth but they couldn't match market rates for freelancers.",
    date: "2 days ago",
    role: "Backend Engineer",
    seniority: "Senior",
    ratings: { salary: 2, learning: 3, vibes: 5 },
    replies: [],
  },
];
