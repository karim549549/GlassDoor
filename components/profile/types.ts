export interface UserSkillEntry {
  userId?: string;
  skillId?: string;
  skill?: { id: string; name: string };
}

export interface UserJobTypeEntry {
  userId?: string;
  jobTypeId?: string;
  jobType?: { id: string; name: string };
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  handle: string | null;
  email: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio?: string | null;
  employmentStatus?: string | null;
  currentEmployer?: string | null;
  seniority?: string | null;
  education?: string | null;
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
