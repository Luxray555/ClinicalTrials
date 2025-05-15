import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '@/embedding/embedding.service';
import { ClinicalTrialsService } from '@/clinical-trials/clinical-trials.service';
import { Patient } from '@/lib/types/data-model';
import { RecommendationResult } from './entities';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { PatientsService } from '@/patients/patients.service';
import { int } from 'neo4j-driver';



@Injectable()
export class RecommendationService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly clinicalTrialService: ClinicalTrialsService,
    private readonly neo4jService: Neo4jService, // Replace with actual type
    private readonly patientService: PatientsService, // Replace with actual type
  ) { };


  async recommendTrialsForPatient(
    patientId: string,
    numberOfRecommendations: number = 5,
  ): Promise<RecommendationResult> {
    // embed the patient profile first : 
    const patient = await this.patientService.findOnePatientById(patientId);
    const patientString = this.patientService.stringifyPatient(patient);
    const queryEmbedding = await this.embeddingService.embedText(patientString);


    const query = `
      CALL db.index.vector.queryNodes('clinicalTrialsVI', $numberOfRecommendations, $queryEmbedding)
      YIELD node AS ct, score
      RETURN
          ct.id AS id,
          score
      `;
    // 2. Define Query Parameters
    const params = {
      queryEmbedding: queryEmbedding,
      numberOfRecommendations: int(numberOfRecommendations + 1),
    };
    // 3. Execute the Query using the Neo4jService
    const result = await this.neo4jService
      .initQuery()
      .raw(query, params)
      .run();
    const recommendations: RecommendationResult = await Promise.all(
      result.map(async (record) => {
        return {
          recommendation: await this.clinicalTrialService.findOne(record.id),
          score: record.score,
        };
      })
    );
    return recommendations;



  }
  // do i pass for him the clinical trial or the id of the clinical trial ?
  async findSimilarTrials(
    ctId: string,
    numberOfRecommendations: number = 5,
  ): Promise<RecommendationResult> {

    const query = `
      MATCH (m:ClinicalTrial {id: $id})
      CALL db.index.vector.queryNodes('clinicalTrialsVI', $numberOfRecommendations, m.embedding)
      YIELD node AS ct, score
      where score < 0.99
      // Return desired properties of the similar trial (ct) and the score
      // Adjust returned properties (ct.id, ct.briefTitle, etc.) as needed for your RecommendedTrial interface
      RETURN
          ct.id AS id,
          score
      `;

    // 2. Define Query Parameters
    const params = {
      id: ctId,
      numberOfRecommendations: int(numberOfRecommendations + 1),
    };

    // 3. Execute the Query using the Neo4jService
    const result = await this.neo4jService
      .initQuery()
      .raw(query, params)
      .run();

    const recommendations: RecommendationResult = await Promise.all(
      result.map(async (record) => {
        return {
          recommendation: await this.clinicalTrialService.findOne(record.id),
          score: record.score,
        };
      })
    );
    return recommendations;
    // Implementation needed
  }

  async searchTrialsByDescription(
    input: string,
    numberOfRecommendations: number = 5,
  ): Promise<RecommendationResult> {

    const queryEmbedding = await this.embeddingService.embedText(input);
    const query = `
      CALL db.index.vector.queryNodes('clinicalTrialsVI', $numberOfRecommendations, $queryEmbedding)
      YIELD node AS ct, score
      RETURN
          ct.id AS id,
          score
      `;

    // 2. Define Query Parameters
    const params = {
      queryEmbedding: queryEmbedding,
      numberOfRecommendations: int(numberOfRecommendations + 1),
    };
    // 3. Execute the Query using the Neo4jService
    const result = await this.neo4jService
      .initQuery()
      .raw(query, params)
      .run();

    const recommendations: RecommendationResult = await Promise.all(
      result.map(async (record) => {
        return {
          recommendation: await this.clinicalTrialService.findOne(record.id),
          score: record.score,
        };
      })
    );
    return recommendations;

  }


  // Todo : create a recommendation mechanism : 

  //! scenario 1 : 
  //* before the loading of a clinical trial into the db we embed it 
  //* but we embed what ? description + conditions and that's it. + interventions + prolly the criteria ?
  //*  final solution : the transformer gives back the embedding string. 
  //*    the ct.updateOrInsert ( takes the ct and call the embedding normally i think)
  //*     the etlPipeline can get the result of the transformer.embedText to embed and embed it and pass it to the loader
  //* now to insert the the embedding of what  , and in which phase ? in the update its easy also                                                                                                   

  // now in the function ta3 bilal ta3 update , okay before the update 

  //! scenario 2 : 
  //? if we do realtime recommendation ?
  //?   >> i get the ct , and then do hard filtering on it , and then embed the results and shit , which is an ok solution


  //! functionalities : 
  //* 1. recommend clinical trials for patient( i got the patient profile , i first do hard rules filtering , then )
  //* 2. now recommend similar clinical trials for a trial (number of recommendations / i return their score too)
  //* 3. search by Ai ( write a small description of the clinical trial and i will return the most relevant clinical trials)






}//end of class 