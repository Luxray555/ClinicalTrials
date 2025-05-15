export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  phoneNumber: string;
  postalCode: string;
  healthStatus:
    | 'STABLE'
    | 'IMPROVING'
    | 'DETERIORATING'
    | 'CRITICAL'
    | 'RECOVERED'
    | 'UNDER_TREATMENT'
    | 'UNKNOWN';
  medicalHistory?: string;
}
