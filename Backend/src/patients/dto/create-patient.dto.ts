import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsPostalCode,
  IsString,
  MinLength,
} from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

enum HealthStatus {
  STABLE = 'STABLE',
  IMPROVING = 'IMPROVING',
  DETERIORATING = 'DETERIORATING',
  CRITICAL = 'CRITICAL',
  RECOVERED = 'RECOVERED',
  UNDER_TREATMENT = 'UNDER_TREATMENT',
  UNKNOWN = 'UNKNOWN',
}

export class CreatePatientDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsEnum(HealthStatus)
  @IsNotEmpty()
  healthStatus: HealthStatus;

  @IsString()
  medicalHistory: string;

  // @IsString()
  // @IsOptional()
  // image: string;
}
