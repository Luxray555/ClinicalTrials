import { ClinicalTrial, Location } from '@/lib/types/data-model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Neo4jService } from 'src/neo4j/neo4j.service';
import { ClinicalTrialQueryDto } from './dto/query.dto';
import { int } from 'neo4j-driver';
import { toProperCase } from '@/lib/utils/common';
import { Neo4jLoader } from '@/etl-pipeline/loaders/neo4j.loader';
import { EmbeddingService } from '@/embedding/embedding.service';

@Injectable()
export class ClinicalTrialsRepository {
  private itemsPerPage = 10;

  constructor(private readonly neo4jService: Neo4jService, private readonly embeddingService: EmbeddingService) { }

  async getClinicalTrial(id: string): Promise<ClinicalTrial> {
    const query = `
            MATCH (clinicalTrial:ClinicalTrial {id: $id})
            OPTIONAL MATCH (clinicalTrial)-[:STUDIES_CONDITION]->(condition:Condition)
            OPTIONAL MATCH (clinicalTrial)-[:USES_INTERVENTION]->(intervention:Intervention)
            OPTIONAL MATCH (clinicalTrial)-[:HAS_DATES]->(dates:ClinicalTrialDates)
            OPTIONAL MATCH (clinicalTrial)-[:HAS_ELIGIBILITY]->(eligibility:Eligibility)
            OPTIONAL MATCH (clinicalTrial)-[:LOCATED_AT]->(location:Location)
            OPTIONAL MATCH (clinicalTrial)-[:HAS_COLLABORATOR]->(collaborator:Collaborator)
            OPTIONAL MATCH (clinicalTrial)-[:HAS_CONTACT]->(contact:Contact)
            OPTIONAL MATCH (clinicalTrial)-[:SPONSORED_BY]->(sponsor:Sponsor)
            // Get source metadata
            OPTIONAL MATCH (clinicalTrial)-[:HAS_METADATA]->(metadata:ClinicalTrialMetaData)
            OPTIONAL MATCH (metadata)-[:FROM_SOURCE]->(dataSource:DataSource)

            RETURN 
                //clinicalTrial,
                   {
                    id: clinicalTrial.id,
                    title: clinicalTrial.title,
                    summary: clinicalTrial.summary,
                    description: clinicalTrial.description,
                    status: clinicalTrial.status,
                    phase: clinicalTrial.phase,
                    type: clinicalTrial.type,
                    currentEnrollmentCount: clinicalTrial.currentEnrollmentCount
                    // Add any other properties from ClinicalTrial node you need...
                } AS clinicalTrial, 

                collect(DISTINCT condition) AS conditions,
                collect(DISTINCT intervention) AS interventions,
                dates,
                eligibility,
                collect(DISTINCT location) AS locations,
                collect(DISTINCT collaborator) AS collaborators,
                collect(DISTINCT contact) AS contacts,
                sponsor, 
                {
                    originalSourceId: metadata.originalSourceId,
                    trialSourceUrl: metadata.trialSourceUrl,
                    dataSource: {
                        id: dataSource.id,
                        name: dataSource.name,
                        type: dataSource.type
                        //uri: dataSource.uri
                    }
                } AS sourceMetaData
        `;
    const result = await this.neo4jService.initQuery().raw(query, { id }).run();

    if (!result.length) {
      throw new NotFoundException(`Clinical trial with ID ${id} not found`);
    }

    const trial = result[0];
    return {
      ...trial.clinicalTrial,
      conditions: trial?.conditions.map((c: any) => c.properties),
      interventions: trial?.interventions.map((i: any) => i.properties),
      locations: trial.locations.map((l: any) => l.properties),
      collaborators: trial.collaborators.map((col: any) => col.properties),
      contacts: trial?.contacts.map((con: any) => con.properties),
      sourceMetaData: trial?.sourceMetaData,

      eligibility: trial.eligibility?.properties || {},
      dates: trial.dates?.properties || {},
      sponsor: trial?.sponsor?.properties || {},
    } as ClinicalTrial;
  }



  // ... other methods like findSimilarTrials ...

  async getAllClinicalTrials(ctQuery: ClinicalTrialQueryDto): Promise<{
    clinicalTrials: ClinicalTrial[];
    pagination: {
      currentPage: number;
      totalPages: number;
      itemsPerPage: number;
      totalItems: number;
    };
  }> {
    const defaultItemsPerPage = this.itemsPerPage; // Default number of items per page
    const page = ctQuery.page ?? 1; // Default to the first page if not provided
    const itemsPerPage = ctQuery.itemsPerPage ?? defaultItemsPerPage;
    const skip = (page - 1) * itemsPerPage;

    // Build the filters query dynamically
    const filtersQuery: { match: string; trialFilter: string } =
      await this.buildFiltersQueryString(ctQuery);


    const query = `
        CALL {
            ${ctQuery.condition
        ? `
                CALL db.index.fulltext.queryNodes("conditions", $fulltextQuery + "~") 
                YIELD node
                MATCH (trial:ClinicalTrial)-[:STUDIES_CONDITION]->(node:Condition)
                RETURN DISTINCT trial, 99 AS score, "conditions_query" AS source
                UNION DISTINCT
            `
        : ''
      }
            
            CALL db.index.fulltext.queryNodes("clinicalTrials", $fulltextQuery + "~") 
            YIELD node, score
            RETURN DISTINCT node AS trial, "fulltext_query" AS source, score
        }
        WITH trial, source, score
        
        ${filtersQuery.trialFilter + filtersQuery.match}  // Apply filters BEFORE counting and pagination
        
        // Count total items before pagination
        WITH COUNT(DISTINCT trial) AS totalItems, COLLECT(DISTINCT trial) AS allTrials
        
        // Apply pagination AFTER counting
        WITH allTrials, totalItems
        UNWIND allTrials AS trial
        SKIP $skip
        LIMIT $itemsPerPage
        
        // Reapply OPTIONAL MATCHES (filtersQuery only affected the count)
        ${filtersQuery.match}
        

// Get source metadata
OPTIONAL MATCH (trial)-[:HAS_METADATA]->(metadata:ClinicalTrialMetaData)
OPTIONAL MATCH (metadata)-[:FROM_SOURCE]->(dataSource:DataSource)

// Collect related data per trial
WITH DISTINCT trial, totalItems,
    COLLECT(DISTINCT condition {.*}) AS conditions,
    COLLECT(DISTINCT interventions {.*}) AS interventions,
    COLLECT(DISTINCT location {.*}) AS locations,
    COLLECT(DISTINCT collaborator {.*}) AS collaborators,
    COLLECT(DISTINCT contact {.*}) AS contacts, 
    sponsor {.*} AS sponsor,
    eligibility {.*} AS eligibility,
    dates {.*} AS dates,
    {
        originalSourceId: metadata.originalSourceId,
        trialSourceUrl: metadata.trialSourceUrl,
        dataSource: {
            id: dataSource.id,
            name: dataSource.name,
            type: dataSource.type
            //uri: dataSource.uri
        }
    } AS sourceMetaData

// Final return
RETURN 
    //DISTINCT trial {.*} AS clinicalTrial,
         DISTINCT {
                id: trial.id,
                title: trial.title, // Ensure these property names are correct
                summary: trial.summary,
                description: trial.description,
                status: trial.status,
                phase: trial.phase,
                type: trial.type,
                currentEnrollmentCount: trial.currentEnrollmentCount
                // Add ALL other necessary properties from the ClinicalTrial node here...
            } AS clinicalTrial, // The map of core trial properties

    sponsor,
    conditions,
    locations,
    eligibility,
    collaborators,
    interventions,
    dates,
    contacts,
    sourceMetaData,
    totalItems  // Include
        
       
        `;
    const fulltextQuery = ctQuery?.condition || '*';

    // Execute the query
    const res = await this.neo4jService
      .initQuery()
      .raw(query, {
        fulltextQuery,
        skip: int(skip),
        itemsPerPage: int(itemsPerPage),
      })
      .run();

    if (res.length === 0) {
      return {
        clinicalTrials: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          itemsPerPage: itemsPerPage,
          totalItems: 0,
        },
      };
    }

    // Extract total items from the first record
    const totalItems = res[0].totalItems;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Map the results to ClinicalTrial objects
    const clinicalTrials = res.map((record) => {
      return {
        ...record.clinicalTrial,
        conditions: record.conditions || [],
        interventions: record.interventions || [],
        dates: record.dates || {},
        eligibility: record.eligibility || {},
        locations: record.locations || [],
        sourceMetaData: record.sourceMetaData || { dataSource: {} },
        collaborators: record.collaborators || [],
        contacts: record.contacts || [],
        sponsor: record.sponsor || {},
      } as ClinicalTrial;
    });

    // Construct the response object
    return {
      clinicalTrials,
      pagination: {
        currentPage: page,
        totalPages,
        itemsPerPage: itemsPerPage,
        totalItems,
      },
    };
  }

  private async buildFiltersQueryString(
    ctQuery: ClinicalTrialQueryDto,
  ): Promise<{ match: string; trialFilter: string }> {
    const RADIUS = 120; // Default radius to 50 km if not provided

    // Initialize base query string and match clauses
    let query = '';
    let matchClauses: string[] = [];
    let clinicalTrialClauses: string[] = [];

    // Add MATCH or OPTIONAL MATCH clauses with direct filters
    matchClauses.push(`
            OPTIONAL MATCH (trial)-[:STUDIES_CONDITION]->(condition:Condition)
            OPTIONAL MATCH (trial)-[:HAS_COLLABORATOR]->(collaborator:Collaborator)
            OPTIONAL MATCH (trial)-[:HAS_CONTACT]->(contact:Contact)
            OPTIONAL MATCH (trial)-[:SPONSORED_BY]->(sponsor:Sponsor)
        `);

    // Status filter
    if (ctQuery.status?.length) {
      clinicalTrialClauses.push(
        `trial.status IN (${JSON.stringify(ctQuery.status)})`,
      );
    }

    // Type filter
    if (ctQuery.type?.length) {
      clinicalTrialClauses.push(
        `trial.type IN (${JSON.stringify(ctQuery.type)})`,
      );
    }

    // Phase filter
    if (ctQuery.phase?.length) {
      clinicalTrialClauses.push(
        `trial.phase IN (${JSON.stringify(ctQuery.phase)})`,
      );
    }

    // Intervention Type filter
    if (ctQuery.interventionType?.length) {
      matchClauses.push(`
                    MATCH (trial)-[:USES_INTERVENTION]->(interventions:Intervention)
                    WHERE interventions.type IN ${JSON.stringify(ctQuery.interventionType)}
                `);
    } else {
      matchClauses.push(`
                    OPTIONAL MATCH (trial)-[:USES_INTERVENTION]->(interventions:Intervention)
                `);
    }
    if (ctQuery.sourceName) {
      matchClauses.push(`
                    MATCH (trial)-[:HAS_METADATA]->(meta)-[:FROM_SOURCE]->(trialDataSource)
                    WHERE trialDataSource.name = "${ctQuery.sourceName}"
                `);
    }

    if (ctQuery.startDate || ctQuery.completionDate) {
      let dateFilters: string = '';

      if (ctQuery.startDate && ctQuery.completionDate) {
        dateFilters = `dates.startDate >= "${ctQuery.startDate}" AND dates.estimatedCompletionDate <= "${ctQuery.completionDate}"`;
      } else if (ctQuery.startDate) {
        dateFilters = `dates.startDate >= "${ctQuery.startDate}"`;
      } else {
        dateFilters = `dates.estimatedCompletionDate <= "${ctQuery.completionDate}"`;
      }
      matchClauses.push(`
                MATCH (trial)-[:HAS_DATES]->(dates:ClinicalTrialDates)
                WHERE ${dateFilters}
            `);
    } else {
      matchClauses.push(`
            OPTIONAL MATCH (trial)-[:HAS_DATES]->(dates:ClinicalTrialDates)
            `);
    }

    if (ctQuery.latitude && ctQuery.longitude) {
      const radius = ctQuery.radius || RADIUS; // Default radius to 120 km if not provided

      matchClauses.push(`
                MATCH (trial)-[:LOCATED_AT]->(location:Location)
                WHERE 6371 * 2 * 
                        ASIN(
                        SQRT(
                            SIN(RADIANS(location.latitude - ${ctQuery.latitude}) / 2) ^ 2 + 
                            COS(RADIANS(${ctQuery.latitude})) * COS(RADIANS(location.latitude)) * 
                            SIN(RADIANS(location.longitude - ${ctQuery.longitude}) / 2) ^ 2
                        )
                        ) <= ${radius}
            `);
    } else if (ctQuery.country || ctQuery.city) {
      let locationFilter: string[] = [];
      if (ctQuery.city) {
        if (ctQuery.radius) {
          let cityLocation: Location = {};
          const subQuery = `
                    MATCH (l:Location)
                        WHERE (l.city = "${toProperCase(ctQuery.city)}" OR l.city = "${ctQuery.city}"  )
                        AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL
                        WITH l.country AS ctr, COUNT(l) AS locationCount
                        ORDER BY locationCount DESC
                        LIMIT 1
                        // Now, retrieve the most relevant location(s) from that country
                        MATCH (finalLocation:Location)
                        WHERE finalLocation.city = "${toProperCase(ctQuery.city)}" AND finalLocation.country = ctr
                        RETURN finalLocation as sourceLocation
                        LIMIT 1
                    `;

          const res = await this.neo4jService.initQuery().raw(subQuery).run();

          if (res.length > 0) {
            cityLocation = res[0].sourceLocation.properties as Location;
            locationFilter.push(` 
                            6371 * 2 * 
                            ASIN(
                                SQRT(
                                    SIN(RADIANS(location.latitude - ${cityLocation.latitude}) / 2) ^ 2 + 
                                    COS(RADIANS(${cityLocation.latitude})) * COS(RADIANS(location.latitude)) * 
                                    SIN(RADIANS(location.longitude - ${cityLocation.longitude}) / 2) ^ 2
                                    )
                                    ) <= ${ctQuery.radius}   // This filters locations within 120 km radius of Milano
                                    `);
          } else
            locationFilter.push(
              `(location.city = "${toProperCase(ctQuery.city)}") OR (location.city = "${ctQuery.city}")`,
            );
        } else
          locationFilter.push(
            `(location.city = "${toProperCase(ctQuery.city)}") OR (location.city = "${ctQuery.city}")`,
          );
      } else if (ctQuery.country) {
        locationFilter.push(
          `location.country = "${toProperCase(ctQuery.country)}"`,
        );
      }

      matchClauses.push(`
                MATCH (trial)-[:LOCATED_AT]->(location :Location)
                WHERE ${locationFilter.join(' AND ')}
            `);
    } else {
      matchClauses.push(`
                OPTIONAL MATCH (trial)-[:LOCATED_AT]->(location:Location)
            `);
    }

    // Eligibility filters
    if (
      ctQuery.gender ||
      ctQuery.minAge !== undefined ||
      ctQuery.maxAge !== undefined
    ) {
      const eligibilityFilters: string[] = [];
      if (ctQuery.gender) {
        eligibilityFilters.push(`eligibility.gender = "${ctQuery.gender}"`);
      }
      if (ctQuery.minAge !== undefined) {
        eligibilityFilters.push(`eligibility.minAge >= ${ctQuery.minAge}`);
      }
      if (ctQuery.maxAge !== undefined) {
        eligibilityFilters.push(`eligibility.maxAge <= ${ctQuery.maxAge}`);
      }
      matchClauses.push(`
                MATCH (trial)-[:HAS_ELIGIBILITY]->(eligibility:Eligibility)
                ${eligibilityFilters.length > 0 ? `WHERE ${eligibilityFilters.join(' AND ')}` : ''}
            `);
    } else {
      matchClauses.push(`
                OPTIONAL MATCH (trial)-[:HAS_ELIGIBILITY]->(eligibility:Eligibility)
            `);
    }

    // Join all match clauses and append global WHERE if needed
    if (clinicalTrialClauses.length > 0) {
      query += '\n WHERE ' + clinicalTrialClauses.join(' AND ') + '\n';
    }

    return { match: matchClauses.join('\n'), trialFilter: query };
  }

  async getCitiesFromCountry(country: string): Promise<string[]> {
    const query = `
        MATCH (l:Location)
        WHERE l.country = "${toProperCase(country)}"
        and l.city is not null 
        RETURN DISTINCT l.city as city
        `;

    const res = await this.neo4jService.initQuery().raw(query).run();
    return res.map((r) => r.city);
  }

  async getClinicalTrialByOriginalTrialId(
    originalTrialId: string,
  ): Promise<ClinicalTrial> {
    const query = `
        MATCH (clinicalTrial:ClinicalTrial)
        OPTIONAL MATCH (clinicalTrial)-[:STUDIES_CONDITION]->(condition:Condition)
        OPTIONAL MATCH (clinicalTrial)-[:USES_INTERVENTION]->(intervention:Intervention)
        OPTIONAL MATCH (clinicalTrial)-[:HAS_DATES]->(dates:ClinicalTrialDates)
        OPTIONAL MATCH (clinicalTrial)-[:HAS_ELIGIBILITY]->(eligibility:Eligibility)
        OPTIONAL MATCH (clinicalTrial)-[:LOCATED_AT]->(location:Location)
        OPTIONAL MATCH (clinicalTrial)-[:HAS_COLLABORATOR]->(collaborator:Collaborator)
        OPTIONAL MATCH (clinicalTrial)-[:HAS_CONTACT]->(contact:Contact)
        OPTIONAL MATCH (clinicalTrial)-[:SPONSORED_BY]->(sponsor:Sponsor)
        // Get source metadata
         MATCH (clinicalTrial)-[:HAS_METADATA]->(metadata:ClinicalTrialMetaData)
         where metadata.originalSourceId = $originalTrialId
        OPTIONAL MATCH (metadata)-[:FROM_SOURCE]->(dataSource:DataSource)

        RETURN 
            clinicalTrial,
            collect(DISTINCT condition) AS conditions,
            collect(DISTINCT intervention) AS interventions,
            dates,
            eligibility,
            collect(DISTINCT location) AS locations,
            collect(DISTINCT collaborator) AS collaborators,
            collect(DISTINCT contact) AS contacts,
            sponsor, 
            {
                originalSourceId: metadata.originalSourceId,
                trialSourceUrl: metadata.trialSourceUrl,
                dataSource: {
                    id: dataSource.id,
                    name: dataSource.name,
                    type: dataSource.type
                    //uri: dataSource.uri
                }
            } AS sourceMetaData
        `;

    const result = await this.neo4jService
      .initQuery()
      .raw(query, { originalTrialId })
      .run();

    if (!result.length) {
      return null;
    }

    const trial = result[0];
    return {
      ...trial.clinicalTrial.properties,
      conditions: trial?.conditions.map((c: any) => c.properties),
      interventions: trial?.interventions.map((i: any) => i.properties),
      locations: trial.locations.map((l: any) => l.properties),
      collaborators: trial.collaborators.map((col: any) => col.properties),
      contacts: trial?.contacts.map((con: any) => con.properties),
      sourceMetaData: trial?.sourceMetaData,
      eligibility: trial.eligibility?.properties || {},
      dates: trial.dates?.properties || {},
      sponsor: trial?.sponsor?.properties || {},
    } as ClinicalTrial;
  }

  async updateOrCreate(trial: ClinicalTrial) {
    const loader = new Neo4jLoader(this.neo4jService, this.embeddingService);
    return loader.insertOneClinicalTrial(trial);
  }

  async getTotalTrialsForAllSources() {
    const query = `
        MATCH (clinicalTrial:ClinicalTrial)
        OPTIONAL MATCH (clinicalTrial)-[:HAS_METADATA]->(metadata:ClinicalTrialMetaData)
        OPTIONAL MATCH (metadata)-[:FROM_SOURCE]->(dataSource:DataSource)
        RETURN COUNT(DISTINCT clinicalTrial) AS totalTrials, dataSource.name AS source
    `;

    const result = await this.neo4jService.initQuery().raw(query).run();

    const formattedResult: Record<string, number> = {};

    for (const row of result) {
      if (row.source) { // ✅ Only if source is not null
        formattedResult[row.source] = row.totalTrials;
      }
    }

    return formattedResult;
  }



}
