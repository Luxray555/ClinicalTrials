import { Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { LoggerService } from '@/logger/logger.service';
import { EtlPipelineModule } from '@/etl-pipeline/etl-pipeline.module';

@Module({
  imports: [EtlPipelineModule],
  controllers: [AdminsController],
  providers: [AdminsService, LoggerService],
  exports: [AdminsService],
})
export class AdminsModule { }
