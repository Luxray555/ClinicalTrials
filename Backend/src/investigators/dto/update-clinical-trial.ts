import { PartialType } from '@nestjs/mapped-types';
import { CreateNewClinicalTrialDto } from './create-new-clinical-trial.dto';

export class UpdateClinicalTrialDto extends PartialType(
  CreateNewClinicalTrialDto,
) {}
