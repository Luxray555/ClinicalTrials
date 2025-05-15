import {
  IsOptional,
  IsEnum,
  IsString,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsPositive,
  IsArray,
} from 'class-validator';
import {
  ClinicalTrialStatusEnum,
  ClinicalTrialTypeEnum,
  ClinicalTrialPhaseEnum,
  InterventionTypeEnum,
  GenderEnum,
  InterventionType,
  ClinicalTrialPhase,
  ClinicalTrialType,
  ClinicalTrialStatus,
  Gender,
  OrderByEnum,
  OrderBy,
} from '@/lib/types/data-model';
import { Type } from 'class-transformer';
import { IsValidDateFormat, TransformToArray } from './query-validators';







export class ClinicalTrialQueryDto {
  @IsOptional()
  @IsArray()
  @TransformToArray()
  @IsEnum(ClinicalTrialStatusEnum, { each: true })
  status: ClinicalTrialStatus[];


  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(ClinicalTrialTypeEnum, { each: true })
  type: ClinicalTrialType[];

  @IsOptional()
  @TransformToArray()
  @IsArray()
  @IsEnum(ClinicalTrialPhaseEnum, { each: true })
  phase: ClinicalTrialPhase[];

  @IsOptional()
  @IsString()
  organization: string;

  @IsOptional()
  @IsString()
  sourceName: string;

  @IsOptional()
  @IsArray()
  @TransformToArray()
  @IsEnum(InterventionTypeEnum, {
    each: true,
  })
  interventionType: InterventionType[];

  @IsOptional()
  @IsEnum(GenderEnum)
  gender: Gender;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minAge: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  maxAge: number;

  @IsOptional()
  @IsString()
  condition: string;

  @IsOptional()
  @IsString()
  @IsValidDateFormat({
    message: 'startDate must be a valid date in the format yyyy-mm-dd',
  })
  startDate: string;

  @IsOptional()
  @IsString()
  @IsValidDateFormat({
    message: 'completionDate must be a valid date in the format yyyy-mm-dd',
  })
  completionDate: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  radius: number;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  latitude: string;


  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy: OrderBy;

  @IsOptional()
  @IsString()
  longitude: string;

  // Pagination
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(100)
  @Type(() => Number)
  itemsPerPage: number;
}
