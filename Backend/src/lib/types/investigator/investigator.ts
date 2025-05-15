export interface Investigator {
  id: string;
  firstName: string;
  lastName: string;
  institution: string;
  institutionAddress: string;
  institutionContactNumber: string;
  investigatorRole: string;
  gender: 'MALE' | 'FEMALE';
  image?: string;
}
