import { Gender, Role } from "./auth";

export type Doctor = {
  doctor: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    gender: Gender;
    id: string;
    medicalLicenseNumber: string;
    hospital: string;
    image: string;
    speciality: string;
  };
  account: {
    password: string;
    role: Role;
    isBlocked: boolean;
    id: string;
    email: string;
  };
};
