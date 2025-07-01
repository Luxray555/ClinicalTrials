import {
  ClinicalTrial,
  Sponsor,
  Collaborator,
  Intervention,
  ClinicalTrialDates,
  Eligibility,
  Condition,
  Location,
  Contact,
  SourceMetaData,
} from '@/lib/types/data-model';
import { createId } from '@paralleldrive/cuid2';
import { RETRY_LIMIT } from '@/lib/constants/common';
import { IClinicalTrialsLoader } from '@/lib/interfaces/clinical-trials-loader-interface';
import { retryWithBackoff } from '@/lib/utils/common';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { HttpException } from '@nestjs/common';
import { EmbeddingService } from '@/embedding/embedding.service';

export class Neo4jLoader implements IClinicalTrialsLoader {
  private service: Neo4jService;
  private embeddingService: EmbeddingService;

  constructor(service: Neo4jService, embeddingService: EmbeddingService) {
    this.service = service;
    this.embeddingService = embeddingService;
  }

  // embed clinicalTrial , the provider should be a dumb bitch that only embeds 


  async loadClinicalTrialData(studies: ClinicalTrial[]) {
    if (!this.service) {
      throw new Error('Neo4jService not initialized');
    }

    try {
      console.log(
        `Processing ${studies.length} clinical trials sequentially...`,
      );

      // Filter valid studies
      const validStudies = studies.filter(
        (study) => study.sourceMetaData.originalSourceId,
      );

      let completed = 0; // Counter to track progress

      for (const [index, study] of validStudies.entries()) {
        try {

          await retryWithBackoff(() => this.insertOneClinicalTrial(study)); // Sequential execution

        } catch (error) {
          console.error(
            `Error inserting study ${index + 1}/${validStudies.length}:`,
            error,
          );
        }

        // Update progress
        completed++;
        const progress = ((completed / validStudies.length) * 100).toFixed(2);
        console.log(
          `Progress: ${completed}/${validStudies.length} (${progress}%)`,
        );
      }

      console.log('All clinical trials processed sequentially.');
    } catch (error) {
      console.error('Error inserting clinical trial data:', error);
      // throw error;
      throw new HttpException(
        {
          status: 500,
          error: "Internal Server Error",
          message: "Max retries reached",
        },
        500,
      );
    }
  }

  // private async createClinicalTrialNode(
  //   study: ClinicalTrial,
  //   embedding : any , 
  //   originalSourceId?: string,
  // ): Promise<ClinicalTrial> {
  //   const query = `
  //       // Ensure metadata exists
  //       MERGE (metadata:ClinicalTrialMetaData { originalSourceId: $originalSourceId })

  //       // Ensure a trial is linked to this metadata (one-to-one)
  //       MERGE (trial:ClinicalTrial)-[:HAS_METADATA]->(metadata)

  //       // Update trial properties from $study, excluding the id
  //       ON CREATE SET trial = $study , trial.id = randomUUID()
  //       ON MATCH SET trial += $study
  //       // Ensure the trial has an id, either from $study or generated

  //       RETURN trial
  //   `;

  //   const params = {
  //     originalSourceId,
  //     study,
  //   };

  //   const result = await this.service.initQuery().raw(query, params).run();

  //   return result[0]?.trial.properties;
  // }

  private async createClinicalTrialNode(
    study: ClinicalTrial, // The main trial data object
    embedding: number[],   // Embedding vector (array of numbers)
    originalSourceId?: string,
  ): Promise<ClinicalTrial | null> { // Return type can be ClinicalTrial or null if creation fails

    // Prepare properties to set/update, EXCLUDING any 'id' field from the input 'study' object
    // This prevents accidentally overwriting the generated UUID on MATCH
    const { id, ...studyPropsToSet } = study;

    const query = `
      // Ensure metadata exists based on the original source ID
      MERGE (metadata:ClinicalTrialMetaData { originalSourceId: $originalSourceId })

      // Find or create the ClinicalTrial node linked to this metadata
      // This assumes one ClinicalTrial node per unique originalSourceId
      MERGE (trial:ClinicalTrial)-[:HAS_METADATA]->(metadata)

      // ON CREATE: Set properties when the trial node is first created
      ON CREATE SET
          trial = $studyProps,       // Set all properties from the input object (excluding id)
          trial.id = randomUUID(), // Generate a unique ID for the trial node itself
          trial.embedding = $embedding // Store the embedding vector

      // ON MATCH: Update properties if the trial node already exists
      ON MATCH SET
          trial += $studyProps,      // Update existing properties with new values from input
          trial.embedding = $embedding // Always update the embedding if the source data changed

      RETURN trial // Return the created or updated trial node
    `;

    const params = {
      originalSourceId: originalSourceId || study.id || null, // Use input ID as source ID if needed, handle null
      studyProps: studyPropsToSet, // Pass the properties object without 'id'
      embedding: embedding,        // Pass the embedding vector
    };
    const result = await this.service.initQuery().raw(query, params).run();

    return result[0]?.trial.properties;
  }

  private async createSponsorNode(
    sponsor: Sponsor,
    trialId: string,
  ): Promise<Sponsor> {
    const query = `
            MATCH (trial:ClinicalTrial { id: $trialId })
            MERGE (trial)-[:SPONSORED_BY]->(sponsor:Sponsor)
            ON CREATE
                SET sponsor.id = randomUUID(),
                    sponsor += $sponsor
            ON MATCH
                SET sponsor += $sponsor
            RETURN sponsor
        `;

    const params = {
      trialId,
      sponsor,
    };

    const res = await this.service.initQuery().raw(query, params).run();

    return res[0].sponsor.properties;
  }

  private async createEligibilityNode(
    eligibility: Eligibility,
    trialId: string,
  ): Promise<Eligibility> {
    const query = `
            MATCH (trial:ClinicalTrial { id: $trialId })
            MERGE (trial)-[:HAS_ELIGIBILITY]->(eligibility:Eligibility)
            ON CREATE
                SET eligibility.id = randomUUID(),
                    eligibility = $eligibility
            ON MATCH
                SET eligibility = $eligibility
            RETURN eligibility
        `;

    const params = {
      trialId,
      eligibility,
    };

    const res = await this.service.initQuery().raw(query, params).run();

    return res[0].eligibility.properties;
  }

  private async createDatesNode(
    dates: ClinicalTrialDates,
    trialId: string,
  ): Promise<ClinicalTrialDates> {
    const query = `
           MATCH (trial:ClinicalTrial { id: $trialId })

            MATCH (trial:ClinicalTrial { id: $trialId })
            MERGE (trial)-[:HAS_DATES]->(dates:ClinicalTrialDates)
            ON CREATE
                SET dates.id = randomUUID(), 
                    dates.firstFetched = datetime(), 
                    dates.lastUpdated = datetime(),
                    dates += $dates
            ON MATCH
                SET dates+= $dates,
                dates.lastUpdated = datetime()
                RETURN dates
                
                `;
    // dates.lastUpdated = datetime()

    const result = await this.service
      .initQuery()
      .raw(query, { trialId, dates })
      .run();
    return result[0].dates;
  }

  private async createSourceMetaDataNode(
    sourceMetaData: SourceMetaData,
    trialId: string,
  ): Promise<SourceMetaData> {
    const query = `
           MATCH (dataSource:DataSource { name :  $sourceMetaData.dataSource.name })
           MATCH (trial:ClinicalTrial { id: $trialId })

           MERGE (trial)-[:HAS_METADATA]->(metadata:ClinicalTrialMetaData)
           ON CREATE 
               SET metadata.id = randomUUID(), 
                   metadata +=  {originalSourceId : $sourceMetaData.originalSourceId , trialSourceUrl : $sourceMetaData.trialSourceUrl}  
           ON MATCH
               SET metadata +=  {originalSourceId : $sourceMetaData.originalSourceId , trialSourceUrl : $sourceMetaData.trialSourceUrl}

           MERGE (metadata)-[:FROM_SOURCE]->(dataSource)

           RETURN metadata
        `;

    const result = await this.service
      .initQuery()
      .raw(query, { trialId, sourceMetaData })
      .run();
    return result[0].metadata;
  }

  private async createConditionsNodes(
    trialId: string,
    conditions: Condition[],
  ): Promise<void> {
    const query = `
        MATCH (trial:ClinicalTrial { id: $trialId })
        OPTIONAL MATCH (trial)-[r:STUDIES_CONDITION]->(:Condition)
        DELETE r  
        WITH trial, $conditions AS conditions
        UNWIND conditions AS condition
        MERGE (c:Condition { name: condition.name }) 
        ON CREATE SET c.id = randomUUID()
        MERGE (trial)-[:STUDIES_CONDITION]->(c) `;

    const params = {
      trialId,
      conditions: conditions.map((condition) => ({ name: condition.name })), // Passing only condition names
    };

    await this.service.initQuery().raw(query, params).run();
  }


  private async createLocationsNodes(
    trialId: string,
    locations: Location[],
  ): Promise<void> {
    // Remove existing location relationships
    const query = `
            MATCH (trial:ClinicalTrial { id: $trialId })
            OPTIONAL MATCH (trial)-[r:LOCATED_AT]->(existingLoc)
            DELETE r
        `;

    await this.service.initQuery().raw(query, { trialId }).run();

    for (const location of locations) {
      if (!location.country) {
        console.error('Location missing country:', location);
        continue;
      }

      let mergeProperties: string[] = [`country: $country`];
      let conditions: string[] = [`existingLocation.country = $country`];

      if (location.city) {
        conditions.push(`AND existingLocation.city = $city`);
        mergeProperties.push(`city: $city`);
      } else {
        conditions.push(`AND existingLocation.city IS NULL`);
      }

      if (location.facility) {
        conditions.push(`AND existingLocation.facility = $facility`);
        mergeProperties.push(`facility: $facility`);
      } else {
        conditions.push(`AND existingLocation.facility IS NULL`);
      }

      if (location.latitude) {
        conditions.push(`AND existingLocation.latitude = $latitude`);
        mergeProperties.push(`latitude: $latitude`);
      } else {
        conditions.push(`AND existingLocation.latitude IS NULL`);
      }

      if (location.longitude) {
        conditions.push(`AND existingLocation.longitude = $longitude`);
        mergeProperties.push(`longitude: $longitude`);
      } else {
        conditions.push(`AND existingLocation.longitude IS NULL`);
      }

      let query = `
                OPTIONAL MATCH (existingLocation:Location)
                WHERE ${conditions.join('\n')}
    
                WITH existingLocation
                MATCH (trial:ClinicalTrial { id: $trialId })
    
                // Link to existing location if found
                FOREACH (_ IN CASE WHEN existingLocation IS NOT NULL THEN [1] ELSE [] END |
                    MERGE (trial)-[:LOCATED_AT]->(existingLocation)
                )
    
                // Create new location if not found
                FOREACH (_ IN CASE WHEN existingLocation IS NULL THEN [1] ELSE [] END |
                    MERGE (newLocation:Location {
                        ${mergeProperties.join(',\n')}
                    })
                    MERGE (trial)-[:LOCATED_AT]->(newLocation)
                )
            `;

      const params = {
        trialId,
        country: location.country,
        city: location.city || null,
        facility: location.facility || null,
        latitude: location.latitude || null,
        longitude: location.longitude || null,
      };

      await this.service.initQuery().raw(query, params).run();
    }
  }


  private async createContactsNodes(
    trialId: string,
    contacts: Contact[],
  ): Promise<void> {
    const query = `
            // First, remove all existing links between the trial and contacts
            MATCH (trial:ClinicalTrial { id: $trialId })
            OPTIONAL MATCH (trial)-[r:HAS_CONTACT]->(existingContact:Contact)
            DELETE r  // Delete the relationship
    
            WITH trial, existingContact
    
            // Now process each contact passed in the input
            UNWIND $contacts AS contact
            OPTIONAL MATCH (existingContact:Contact)
                WHERE existingContact = contact
    
            // If contact exists, link it to the trial
            FOREACH (_ IN CASE WHEN existingContact IS NOT NULL THEN [1] ELSE [] END |
                MERGE (trial)-[:HAS_CONTACT]->(existingContact)
            )
    
            // If contact does not exist, create it and link it
            FOREACH (_ IN CASE WHEN existingContact IS NULL THEN [1] ELSE [] END |
                CREATE (newContact:Contact { id: randomUUID() })
                SET newContact += contact
                MERGE (trial)-[:HAS_CONTACT]->(newContact)
            )
        `;

    const params = {
      trialId,
      contacts,
    };

    await this.service.initQuery().raw(query, params).run();
  }

  private async createInterventionsNode(
    trialId: string,
    interventions: Intervention[],
  ): Promise<void> {
    const query = `
            // First, remove all existing links between the trial and interventions
            MATCH (trial:ClinicalTrial { id: $trialId })
            OPTIONAL MATCH (trial)-[r:USES_INTERVENTION]->(existingIntervention:Intervention)
            DELETE r  // Delete the relationship
    
            WITH trial, existingIntervention
    
            // Now process each intervention passed in the input
            UNWIND $interventions AS intervention
            OPTIONAL MATCH (existingIntervention:Intervention)
                WHERE existingIntervention = intervention
    
            // If intervention exists, link it to the trial
            FOREACH (_ IN CASE WHEN existingIntervention IS NOT NULL THEN [1] ELSE [] END |
                MERGE (trial)-[:USES_INTERVENTION]->(existingIntervention)
            )
    
            // If intervention does not exist, create it and link it
            FOREACH (_ IN CASE WHEN existingIntervention IS NULL THEN [1] ELSE [] END |
                CREATE (newIntervention:Intervention { id: COALESCE(intervention.id, randomUUID()) })
                SET newIntervention += intervention
                MERGE (trial)-[:USES_INTERVENTION]->(newIntervention)
            )
        `;

    const params = {
      trialId,
      interventions,
    };

    await this.service.initQuery().raw(query, params).run();
  }

  private async createCollaboratorsNodes(
    trialId: string,
    collaborators: Collaborator[],
  ): Promise<void> {
    const query = `
            // First, remove all existing links between the trial and collaborators
            MATCH (trial:ClinicalTrial { id: $trialId })
            OPTIONAL MATCH (trial)-[r:HAS_COLLABORATOR]->(existingCollaborator:Collaborator)
            DELETE r
    
            WITH trial
    
            // Create new collaborator nodes for those that don't exist
            UNWIND $collaborators AS collaborator
            OPTIONAL MATCH (existing:Collaborator { name: collaborator.name })
            
            // Create new collaborators if not found
            MERGE (newCollaborator:Collaborator { name: collaborator.name })
            ON CREATE SET newCollaborator.id = randomUUID(), newCollaborator += collaborator
    
            // Link the trial to the collaborator (new or existing)
            MERGE (trial)-[:HAS_COLLABORATOR]->(newCollaborator)
        `;

    const params = {
      trialId,
      collaborators,
    };

    await this.service.initQuery().raw(query, params).run();
  }

  private stringifyClinicalTrial(study: ClinicalTrial) {
    const text = `
      ${study.title}
      ${study.summary}
      ${(study.conditions || []).map(condition => condition.name).join(', ')}
      ${(study.interventions || []).map(intervention => intervention.name).join(', ')}
      ${(study.eligibility?.eligibilityCriteria || '')}
    `;
    return text;
  }

  public async insertOneClinicalTrial(study: ClinicalTrial) {
    try {
      const {
        sponsor,
        collaborators,
        interventions,
        dates,
        eligibility,
        conditions,
        locations,
        contacts,
        sourceMetaData,
        ...trial
      } = study;

      const embedding = await this.embeddingService.embedText(this.stringifyClinicalTrial(study))
      // Create main trial node first since other nodes depend on it
      const trialResult = await this.createClinicalTrialNode(
        trial,
        embedding,
        sourceMetaData?.originalSourceId,
      );
      const trialId = trialResult.id!;
      const createdNodes = { trial: trialResult };
      const resultData: Record<string, any> = {};

      // Sponsor
      if (sponsor) {
        resultData['sponsor'] = await this.createSponsorNode(sponsor, trialId);
      }

      // Collaborators
      if (collaborators?.length) {
        await this.createCollaboratorsNodes(trialId, collaborators);
        // console.log("collaborators done")
        resultData['collaborators'] = collaborators;
      }

      // Contacts
      if (contacts?.length) {
        await this.createContactsNodes(trialId, contacts);
        // console.log("contacts done", contacts.length)

        // console.log("contacts done")
        resultData['contacts'] = contacts;
      }

      // Interventions
      if (interventions?.length) {
        await this.createInterventionsNode(trialId, interventions);
        // console.log("interventions done")
        resultData['interventions'] = interventions;
      }

      // Dates
      if (dates) {
        resultData['dates'] = await this.createDatesNode(dates, trialId);
        // console.log("dates dones")
      }

      // Eligibility
      if (eligibility) {
        resultData['eligibility'] = await this.createEligibilityNode(
          eligibility,
          trialId,
        );
        // console.log("eligibility done")
      }

      // Conditions
      if (conditions?.length) {
        await this.createConditionsNodes(trialId, conditions);
        // console.log("conditions done")
        resultData['conditions'] = conditions;
      }

      // Locations
      if (locations?.length) {
        await this.createLocationsNodes(trialId, locations);

        // console.log("locations done : ", locations.length);
        resultData['locations'] = locations;
      }

      if (study.sourceMetaData) {
        resultData['sourceMetaData'] = await this.createSourceMetaDataNode(
          study.sourceMetaData,
          trialId,
        );
        // console.log("sourceMetaData done")
      }

      return { ...createdNodes, ...resultData };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
