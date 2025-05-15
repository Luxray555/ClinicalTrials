import { forwardRef, Module } from '@nestjs/common';
import { EtlPipelineService } from './etl-pipeline.service';
import { EtlPipelineController } from './etl-pipeline.controller';
import { LoggerService } from '@/logger/logger.service';
import { GatewayModule } from '@/gateway/gateway.module';
import { ClinicalTrialsModule } from '@/clinical-trials/clinical-trials.module';
import { EmbeddingModule } from '@/embedding/embedding.module';

@Module({
  controllers: [EtlPipelineController],
  imports: [forwardRef(() => GatewayModule), ClinicalTrialsModule, EmbeddingModule],
  providers: [EtlPipelineService, LoggerService],
  exports: [EtlPipelineService],
})
export class EtlPipelineModule { }
