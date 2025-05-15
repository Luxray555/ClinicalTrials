export interface Account {
  id: string;
  email: string;
  password: string;
  isBlocked: boolean;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'INVESTIGATOR';
}
