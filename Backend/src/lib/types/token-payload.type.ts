export type TokenPayloadType = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'INVESTIGATOR';
  isBlocked: boolean;
};
