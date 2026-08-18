export interface UserSkillEntry {
  id: string;
  name: string;
}

export interface UserJobTypeEntry {
  id: string;
  name: string;
}

export interface UserRatingState {
  domain: string;
  rating: number;
  deviation: number;
  volatility: number;
}

export interface UserArenaEntry {
  id: string;
  joinedAt: string | Date;
  arena: {
    id: string;
    title: string;
    domain: string;
    difficulty: string;
  };
  submission: {
    id: string;
    finalScore: number | null;
    githubUrl: string;
    videoUrl: string | null;
    createdAt: string | Date;
    proofPacket: {
      slug: string;
      contentHash: string;
      issuedAt: string | Date;
      isRevoked: boolean;
    } | null;
  } | null;
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  handle: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio?: string | null;
  employmentStatus?: string | null;
  currentEmployer?: string | null;
  seniority?: string | null;
  education?: string | null;
  location?: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  rating: number;
  ratingStates?: UserRatingState[];
  createdAt: string | Date;
  lastActiveAt: string | Date | null;
  skills?: UserSkillEntry[];
  jobTypes?: UserJobTypeEntry[];
  followersCount: number;
  followingCount?: number;
  isFollowing: boolean;
  arenaEntries?: UserArenaEntry[];
}
