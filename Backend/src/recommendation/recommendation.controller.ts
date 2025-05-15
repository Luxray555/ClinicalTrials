import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) { }


  @Get("by-description")
  recommendByDescription(@Body() descriptionBody: { description: string },

    @Query(
      "numberOfRecommendations",
      new DefaultValuePipe('5'),
      ParseIntPipe
    ) numberOfRecommendations: number // The result is now guaranteed to be a number





  ) {
    return this.recommendationService.searchTrialsByDescription(descriptionBody.description, numberOfRecommendations);
  }


  @Get("by-patient/:patientId")
  recommendTrialsForPatient(@Param("patientId") patientId: string, @Query(
    "numberOfRecommendations",
    new DefaultValuePipe('5'),
    ParseIntPipe
  ) numberOfRecommendations: number // The result is now guaranteed to be a number
  ) {
    return this.recommendationService.recommendTrialsForPatient(patientId, numberOfRecommendations);
  }


  @Get("similar-trials/:id")
  findSimilarTrials(@Param("id") id: string,

    @Query(
      "numberOfRecommendations",
      new DefaultValuePipe('5'),
      ParseIntPipe
    ) numberOfRecommendations: number // The result is now guaranteed to be a number


  ) {
    return this.recommendationService.findSimilarTrials(id, numberOfRecommendations);
  }





}
