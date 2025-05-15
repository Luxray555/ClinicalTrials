import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { EmbeddingModule } from '../embedding/embedding.module'; // <-- Need EmbeddingService
import { ClinicalTrialsModule } from '../clinical-trials/clinical-trials.module'; // <-- Need Trial Repository/Service
import { PatientsModule } from '@/patients/patients.module';
import { RecommendationController } from './recommendation.controller';

@Module({
  imports: [
    EmbeddingModule,        // Provides EmbeddingService
    ClinicalTrialsModule,   // Provides ClinicalTrialsRepository (or Service)
    PatientsModule
  ],
  providers: [
    RecommendationService,
  ],
  exports: [
    RecommendationService,
  ],
  controllers: [RecommendationController],
})
export class RecommendationModule { }