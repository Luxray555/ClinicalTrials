import { PartialType } from '@nestjs/mapped-types';
import { CreateEtlPipelineDto } from './create-etl-pipeline.dto';

export class UpdateEtlPipelineDto extends PartialType(CreateEtlPipelineDto) {}
