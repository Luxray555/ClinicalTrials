import { PartialType } from '@nestjs/mapped-types';
import { CreateInvestigatorDto } from './create-investigator.dto';

export class UpdateInvestigatorDto extends PartialType(CreateInvestigatorDto) {}
