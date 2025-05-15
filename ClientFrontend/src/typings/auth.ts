export type Role = "DOCTOR" | "PATIENT" | "INVESTIGATOR";
export type Gender = "MALE" | "FEMALE";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isBlocked: boolean;
  role: Role;
  image: string;
  iat: number;
  exp: number;
};

export type SuccessDoctorRegisterResponse = {
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    gender: Gender;
    medicalLicenseNumber: string;
    hospital: string;
  };
  account: {
    id: string;
    password: string;
    role: Role;
    isBlocked: boolean;
    email: string;
  };
};

export type SuccessInvestigatorRegisterResponse = {
  investigator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
    institutionAddress: string;
    institutionContactNumber: string;
    investigatorRole: string;
  };
  account: {
    id: string;
    password: string;
    role: Role;
    isBlocked: boolean;
    email: string;
  };
};
