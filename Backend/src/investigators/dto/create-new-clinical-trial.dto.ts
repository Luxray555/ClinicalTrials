import { TransformToArray } from '@/clinical-trials/dto/query-validators';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Integer } from 'neo4j-driver';

enum ClinicalTrialStatusEnum {
  COMPLETED = 'COMPLETED',
  NOT_YET_RECRUITING = 'NOT_YET_RECRUITING',
  UNKNOWN = 'UNKNOWN',
  ACTIVE_NOT_RECRUITING = 'ACTIVE_NOT_RECRUITING',
  WITHDRAWN = 'WITHDRAWN',
  TERMINATED = 'TERMINATED',
  RECRUITING = 'RECRUITING',
  SUSPENDED = 'SUSPENDED',
  ENROLLING_BY_INVITATION = 'ENROLLING_BY_INVITATION',
  APPROVED_FOR_MARKETING = 'APPROVED_FOR_MARKETING',
  NO_LONGER_AVAILABLE = 'NO_LONGER_AVAILABLE',
  TEMPORARILY_NOT_AVAILABLE = 'TEMPORARILY_NOT_AVAILABLE',
}

enum ClinicalTrialTypeEnum {
  INTERVENTIONAL = 'INTERVENTIONAL',
  OBSERVATIONAL = 'OBSERVATIONAL',
  EXPANDED_ACCESS = 'EXPANDED_ACCESS',
}

enum ClinicalTrialPhaseEnum {
  NA = 'NA',
  PHASE1 = 'PHASE1',
  PHASE2 = 'PHASE2',
  PHASE3 = 'PHASE3',
  PHASE4 = 'PHASE4',
  EARLY_PHASE1 = 'EARLY_PHASE1',
}

enum InterventionTypeEnum {
  DEVICE = 'DEVICE',
  DRUG = 'DRUG',
  OTHER = 'OTHER',
  DIAGNOSTIC_TEST = 'DIAGNOSTIC_TEST',
  BIOLOGICAL = 'BIOLOGICAL',
  PROCEDURE = 'PROCEDURE',
  BEHAVIORAL = 'BEHAVIORAL',
  DIETARY_SUPPLEMENT = 'DIETARY_SUPPLEMENT',
  COMBINATION_PRODUCT = 'COMBINATION_PRODUCT',
  RADIATION = 'RADIATION',
  GENETIC = 'GENETIC',
}

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  ALL = 'ALL',
}

class Sponsor {
  @IsString()
  @IsNotEmpty()
  name: string;
}

class Collaborator {
  @IsString()
  @IsNotEmpty()
  name: string;
}

class Intervention {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(InterventionTypeEnum)
  @IsNotEmpty()
  type: InterventionTypeEnum;
}

class ClinicalTrialDates {
  @IsString()
  @IsOptional()
  lastUpdated: string;

  @IsString()
  @IsOptional()
  firstFetched: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  estimatedCompletionDate: string;
}

class Eligibility {
  @IsString()
  @IsNotEmpty()
  eligibilityCriteria: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minAge: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  maxAge: number;
}

class Condition {
  @IsString()
  @IsNotEmpty()
  name: string;
}

class Location {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @Type(() => Number)
  @IsNotEmpty()
  latitude: number;

  @Type(() => Number)
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  facility: string;
}

class Contact {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsBoolean()
  @IsNotEmpty()
  isMainContact: boolean;
}

class DataSource {
  @IsString()
  @IsNotEmpty()
  name: 'From Investigator';
}

class SourceMetaData {
  @IsString()
  @IsOptional()
  originalSourceId: string;

  @IsString()
  @IsOptional()
  trialSourceUrl: string;

  @ValidateNested()
  @Type(() => DataSource)
  @IsNotEmpty()
  dataSource: DataSource;
}

export class CreateNewClinicalTrialDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ClinicalTrialStatusEnum)
  @IsNotEmpty()
  status: ClinicalTrialStatusEnum;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty()
  currentEnrollmentCount: Integer;

  @IsEnum(ClinicalTrialTypeEnum)
  @IsNotEmpty()
  type: ClinicalTrialTypeEnum;

  @IsEnum(ClinicalTrialPhaseEnum)
  @IsNotEmpty()
  phase: ClinicalTrialPhaseEnum;

  @ValidateNested()
  @Type(() => Sponsor)
  @IsNotEmpty()
  sponsor: Sponsor;

  @TransformToArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Collaborator)
  @IsNotEmpty()
  collaborators: Collaborator[];

  @TransformToArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Intervention)
  @IsNotEmpty()
  interventions: Intervention[];

  @ValidateNested()
  @Type(() => ClinicalTrialDates)
  @IsNotEmpty()
  dates: ClinicalTrialDates;

  @ValidateNested()
  @Type(() => Eligibility)
  @IsNotEmpty()
  eligibility: Eligibility;

  @TransformToArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Condition)
  @IsNotEmpty()
  conditions: Condition[];

  @TransformToArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Location)
  @IsNotEmpty()
  locations: Location[];

  @IsString()
  @IsOptional()
  organization: string;

  @TransformToArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Contact)
  @IsNotEmpty()
  contacts: Contact[];

  @ValidateNested()
  @Type(() => SourceMetaData)
  @IsNotEmpty()
  sourceMetaData: SourceMetaData;
}
