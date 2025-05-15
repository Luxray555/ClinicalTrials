import { PartialType } from '@nestjs/mapped-types';
import { CreateClinicalTrialDto } from './create-clinical-trial.dto';

export class UpdateClinicalTrialDto extends PartialType(CreateClinicalTrialDto) {}
