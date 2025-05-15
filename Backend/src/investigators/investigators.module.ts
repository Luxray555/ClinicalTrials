import { Module } from '@nestjs/common';
import { InvestigatorsService } from './investigators.service';
import { InvestigatorsController } from './investigators.controller';
import { ClinicalTrialsModule } from '@/clinical-trials/clinical-trials.module';
import { EmbeddingModule } from '@/embedding/embedding.module';

@Module({
  imports: [ClinicalTrialsModule, EmbeddingModule],
  controllers: [InvestigatorsController],
  providers: [InvestigatorsService],
  exports: [InvestigatorsService],
})
export class InvestigatorsModule { }
