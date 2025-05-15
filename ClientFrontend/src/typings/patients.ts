import { Gender, Role } from "./auth";

export type Patient = {
  patient: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender: Gender;
    healthStatus:
      | "STABLE"
      | "IMPROVING"
      | "DETERIORATING"
      | "CRITICAL"
      | "RECOVERED"
      | "UNDER_TREATMENT"
      | "UNKNOWN";
    postalCode: string;
    dateOfBirth: string;
    id: string;
    medicalHistory: string;
  };
  account: {
    password: string;
    role: Role;
    isBlocked: false;
    id: string;
    email: string;
  };
};
