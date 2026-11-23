
export const SCHOOL_TYPES = [
  'ELEMENTARY',
  'SECONDARY',
  'PREPARATORY',
  'COMBINED'
] as const;

export type SchoolType = (typeof SCHOOL_TYPES)[number];

export interface SchoolProfile {
  id: string;
  name: string;
  schoolCode: string;
  schoolType: SchoolType;
  region: string | null;
  zone: string | null;
  woreda: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}
