import { Module } from '@nestjs/common';
import { ClinicalTrialsService } from './clinical-trials.service';
import { ClinicalTrialsController } from './clinical-trials.controller';
import { ClinicalTrialsRepository } from './clinical-trials.repository';
import { CsvService } from '@/csv/csv.service';
import { FieldMappingModelService } from '@/field-mapping-model/field-mapping-model.service';
import { FieldMappingModule } from '@/field-mapping-model/field-mapping-model.module';
import { EmbeddingModule } from '@/embedding/embedding.module';

@Module({
  controllers: [ClinicalTrialsController],
  imports: [FieldMappingModule, EmbeddingModule],
  providers: [ClinicalTrialsService, ClinicalTrialsRepository, CsvService],
  exports: [ClinicalTrialsService, ClinicalTrialsRepository],
})
export class ClinicalTrialsModule { }
