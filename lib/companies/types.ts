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
