export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  medicalLicenseNumber: string;
  hospital: string;
  speciality: string;
  gender: 'MALE' | 'FEMALE';
  image?: string;
}
