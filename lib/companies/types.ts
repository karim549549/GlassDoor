export interface Role {
  title: string;
  exp: string;
  min: number;
  max: number;
  median: number;
  submissions: number;
}

export interface Company {
  id: number;
  name: string;
  sector: string;
  rating: number;
  reviews: number;
  roles: Role[];
}

export interface CommentRatings {
  salary: number;
  learning: number;
  vibes: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  role?: string;
  seniority?: string;
  ratings?: CommentRatings;
  replies: Comment[];
}
