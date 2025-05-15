import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Connection, Query } from 'cypher-query-builder';
import { NEO4J_CONNECTION } from './neo4j.constants';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  constructor(
    @Inject(NEO4J_CONNECTION)
    private readonly connection: Connection,
  ) {}
  onApplicationShutdown() {
    this.connection.close();
  }

  initQuery(): Query {
    return this.connection.query();
  }
}


//* What is the purpose of the Neo4jService class?
//- What will we use the neoj4 db for ?
//- [x] InsertClinicalTrialsData() method to insert clinical trial data into the Neo4j database <IN THE LOADER>
//- [x] getClinicalTrialById(neo4jId: string) method to retrieve a clinical trial from the Neo4j database <i don't know where>
//- [x] PatientProfile()
//- [x] getSavedClinicalTrials(patienId)
//- [x] getSavedClinicalTrials(patientId)

// we have patients service , that will have all the functions related to the patients 

// this service is the one that will have the logic of calling the neo4jService(which is just like  mongoose in this case)
//  in this service we have for example the getClinicalTrialById(id)
    // def : {
    //     neo4jService.initQuery().matchNode
    //     .match([ 
    //         `(clinicalTrial: ClinicalTrial {nctId: "${study.nctId}"})`
    //     ])
    //     .return("clinicalTrial");
    // }
    
