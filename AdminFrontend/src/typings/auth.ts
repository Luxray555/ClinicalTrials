export type Role = "DOCTOR" | "PATIENT";
export type Gender = "MALE" | "FEMALE";

export type CurrentUser = {
  id: number;
  email: string;
  userName: string;
  // lastName: string;
  // isBlocked: boolean;
  // role: Role;
  // image: string;
  iat: number;
  exp: number;
};

export type SuccessRegisterResponse = {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  hospital: string;
  gender: Gender;
  image: string;
  accountId: number;
  createdAt: string;
  updatedAt: string;
  Account: {
    email: string;
    role: Role;
    isBlocked: boolean;
  };
};
