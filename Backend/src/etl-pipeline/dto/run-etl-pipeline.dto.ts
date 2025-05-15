import { ClinicalTrialStatusEnum } from '@/lib/types/data-model';
import {
  IsOptional,
  Min,
  IsDivisibleBy,
  IsArray,
  IsString,
  IsInt,
  IsEnum,
} from 'class-validator';

export class RunEtlPipelineDto {
  @IsOptional()
  @IsInt()
  @Min(100)
  @IsDivisibleBy(100, { message: 'numberOfTrials must be a multiple of 100' })
  numberOfTrials?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @IsDivisibleBy(100, { message: 'startingFrom must be a multiple of 100' })
  startingFrom?: number;

  @IsOptional()
  @IsInt()
  startYear?: number;

  @IsOptional()
  @IsInt()
  endYear?: number;

  @IsOptional()
  // @IsArray()
  @IsString({ each: true }) // Ensure each item in the array is a string
  @IsEnum(ClinicalTrialStatusEnum)
  status?: string[];

  @IsOptional()
  country?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];
}
