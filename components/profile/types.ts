export interface UserSkillEntry {
  id: string;
  name: string;
}

export interface UserJobTypeEntry {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  handle: string | null;
  // Intentionally no `email` - the public profile endpoint does not return one.
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
  createdAt: string | Date;
  lastActiveAt: string | Date | null;
  skills?: UserSkillEntry[];
  jobTypes?: UserJobTypeEntry[];
  followersCount: number;
  isFollowing: boolean;
}
