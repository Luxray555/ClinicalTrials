import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvestigatorDto } from './dto/create-investigator.dto';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { Investigator } from '@/lib/types/investigator/investigator';
import { Account } from '@/lib/types/account/account';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateInvestigatorDto } from './dto/update-investigator.dto';
import { CreateNewClinicalTrialDto } from './dto/create-new-clinical-trial.dto';
import { Neo4jLoader } from '@/etl-pipeline/loaders/neo4j.loader';
import { ClinicalTrialsRepository } from '@/clinical-trials/clinical-trials.repository';
import { ClinicalTrial } from '@/lib/types/data-model';
import { UpdateClinicalTrialDto } from './dto/update-clinical-trial';
import { EmbeddingService } from '@/embedding/embedding.service';

@Injectable()
export class InvestigatorsService {
  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly embeddingService: EmbeddingService,
    private readonly clinicalTrialsRepository: ClinicalTrialsRepository,
  ) { }

  async createInvestigator(
    createInvestigatorDto: CreateInvestigatorDto,
  ): Promise<{ investigator: Investigator; account: Account }> {
    const { email, password, ...rest } = createInvestigatorDto;

    const existingAccount = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account { email: $email })
        RETURN account
        `,
        { email },
      )
      .run();

    if (existingAccount.length) {
      throw new HttpException('Email already exists', 409);
    }

    const id = uuidv4();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        CREATE (investigator:Investigator { id: $id, firstName: $investigatorProps.firstName, lastName: $investigatorProps.lastName, institution: $investigatorProps.institution, institutionAddress: $investigatorProps.institutionAddress, gender: $investigatorProps.gender, image: $investigatorProps.image, institutionContactNumber: $investigatorProps.institutionContactNumber , investigatorRole: $investigatorProps.investigatorRole }) 
        -[:HAS_ACCOUNT]-> (account:Account { id: $id, email: $email, password: $password, isBlocked: true, role: 'INVESTIGATOR' })
        RETURN investigator, account
        `,
        {
          id,
          investigatorProps: rest,
          email,
          password: hashedPassword,
        },
      )
      .run();

    return {
      investigator: {
        ...result[0].investigator.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async findOneInvestigatorById(
    id: string,
  ): Promise<{ investigator: Investigator; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
          MATCH (investigator:Investigator)-[:HAS_ACCOUNT]->(account:Account)
          WHERE investigator.id = $id
          RETURN investigator, account
          `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Investigator with id ${id} not found`);
    }

    return {
      investigator: {
        ...result[0].investigator.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async updateInvestigatorPassword(
    investigatorId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ investigator: Investigator; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
          MATCH (investigator:Investigator)-[:HAS_ACCOUNT]->(account:Account)
          WHERE investigator.id = $investigatorId
          RETURN account
          `,
        { investigatorId },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(
        `Investigator with id ${investigatorId} not found`,
      );
    }

    const account = result[0].account.properties;

    const isPasswordMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      account.password,
    );
    if (!isPasswordMatch) {
      throw new HttpException('Old password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.neo4jService
      .initQuery()
      .raw(
        `
          MATCH (account:Account)
          WHERE account.id = $accountId
          SET account.password = $hashedPassword
          RETURN account
          `,
        { accountId: account.id, hashedPassword },
      )
      .run();

    const finalResult = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (investigator:Investigator)-[:HAS_ACCOUNT]->(account:Account)
        WHERE investigator.id = $investigatorId
        RETURN account
        `,
        { investigatorId },
      )
      .run();

    return {
      investigator: {
        ...finalResult[0].investigator.properties,
      },
      account: {
        ...finalResult[0].account.properties,
      },
    };
  }

  async findInvestigatorByEmail(
    email: string,
  ): Promise<{ investigator: Investigator; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
          MATCH (investigator:Investigator)-[:HAS_ACCOUNT]->(account:Account)
          WHERE account.email = $email
          RETURN investigator, account
          `,
        { email },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Investigator with email ${email} not found`);
    }

    return {
      investigator: {
        ...result[0].investigator.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async updateInvestigatorById(
    id: string,
    updateInvestigatorDto: UpdateInvestigatorDto,
  ): Promise<{ investigator: Investigator; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
          MATCH (investigator:Investigator)-[:HAS_ACCOUNT]->(account:Account)
          WHERE investigator.id = $id
          RETURN investigator, account
          `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Investigator with id ${id} not found`);
    }

    const { password, email, ...rest } = updateInvestigatorDto;

    const updatedInvestigator = await this.neo4jService
      .initQuery()
      .raw(
        `
          MATCH (investigator:Investigator)
          WHERE investigator.id = $id
          SET investigator += $rest
          RETURN investigator
          `,
        { id, rest },
      )
      .run();

    return {
      investigator: {
        ...updatedInvestigator[0].investigator.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async removeInvestigatorById(
    id: string,
  ): Promise<{ investigator: Investigator; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
          MATCH (investigator:Investigator)-[:HAS_ACCOUNT]->(account:Account)
          WHERE investigator.id = $id
          RETURN investigator, account
          `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Investigator with id ${id} not found`);
    }

    const accountData = {
      email: result[0].account.properties.email,
      role: result[0].account.properties.role,
      isBlocked: result[0].account.properties.isBlocked,
    };

    const finalResult = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (investigator:Investigator)-[:HAS_ACCOUNT]->(account:Account)
        WHERE investigator.id = $id
        RETURN account
        `,
        { id },
      )
      .run();

    await this.neo4jService
      .initQuery()
      .raw(
        `
          MATCH (investigator:Investigator)-[:HAS_ACCOUNT]->(account:Account)
          WHERE investigator.id = $id
          DETACH DELETE investigator, account
          `,
        { id },
      )
      .run();

    return {
      investigator: {
        ...finalResult[0].investigator.properties,
      },
      account: {
        ...finalResult[0].account.properties,
      },
    };
  }

  async addNewClinicalTrial(
    investigatorId: string,
    createNewClinicalTrialDto: CreateNewClinicalTrialDto,
  ) {
    const loader = new Neo4jLoader(this.neo4jService, this.embeddingService);
    // const loader = new Neo4jLoader(this.neo4jService);

    const ct = await loader.insertOneClinicalTrial(createNewClinicalTrialDto);

    if (!ct || !ct.trial.id) {
      throw new HttpException(
        'Failed to create clinical trial',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (investigator:Investigator {id: $investigatorId})
        MATCH (clinicalTrial:ClinicalTrial {id: $trialId})
        MERGE (investigator)-[:HAS_CREATED]->(clinicalTrial)
        RETURN clinicalTrial
        `,
        { investigatorId, trialId: ct.trial.id },
      )
      .run();

    const clinicalTrial = await this.clinicalTrialsRepository.getClinicalTrial(
      ct.trial.id,
    );

    return clinicalTrial;
  }

  async getClinicalTrialById(id: string) {
    const clinicalTrial =
      await this.clinicalTrialsRepository.getClinicalTrial(id);

    if (!clinicalTrial) {
      throw new NotFoundException(`Clinical trial with id ${id} not found`);
    }

    return clinicalTrial;
  }

  async getAllClinicalTrials(investigatorId: string) {
    const query = `
  MATCH (investigator:Investigator {id: $investigatorId})-[:HAS_CREATED]->(clinicalTrial:ClinicalTrial)
  
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
      }
    } AS sourceMetaData
`;

    const result = await this.neo4jService
      .initQuery()
      .raw(query, { investigatorId })
      .run();

    // Map each clinical trial row into a usable format
    return result.map((r) => ({
      ...r.clinicalTrial.properties,
      conditions: r.conditions.map((c: any) => c.properties),
      interventions: r.interventions.map((i: any) => i.properties),
      dates: r.dates?.properties || {},
      eligibility: r.eligibility?.properties || {},
      locations: r.locations.map((l: any) => l.properties),
      collaborators: r.collaborators.map((col: any) => col.properties),
      contacts: r.contacts.map((con: any) => con.properties),
      sponsor: r.sponsor?.properties || {},
      sourceMetaData: r.sourceMetaData,
    })) as ClinicalTrial[];
  }

  async removeClinicalTrialById(investigatorId: string, trialId: string) {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (investigator:Investigator {id: $investigatorId})-[:HAS_CREATED]->(ct:ClinicalTrial {id: $trialId})
        RETURN ct
        `,
        { investigatorId, trialId },
      )
      .first();

    if (!result) {
      throw new HttpException(
        'Clinical trial not found or not created by this investigator',
        HttpStatus.FORBIDDEN,
      );
    }

    const clinicalTrial =
      await this.clinicalTrialsRepository.getClinicalTrial(trialId);

    await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (ct:ClinicalTrial {id: $trialId})
        OPTIONAL MATCH (ct)-[r]->(relatedNode)
        DETACH DELETE ct, relatedNode
        `,
        { trialId },
      )
      .run();

    return clinicalTrial;
  }

  async updateClinicalTrialById(
    investigatorId: string,
    trialId: string,
    updateClinicalTrialDto: UpdateClinicalTrialDto,
  ) {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (investigator:Investigator {id: $investigatorId})-[:HAS_CREATED]->(ct:ClinicalTrial {id: $trialId})
        RETURN ct
        `,
        { investigatorId, trialId },
      )
      .first();

    if (!result) {
      throw new HttpException(
        'Clinical trial not found or not created by this investigator',
        HttpStatus.FORBIDDEN,
      );
    }

    if (updateClinicalTrialDto.title) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
        MATCH (ct:ClinicalTrial {id: $trialId})
        SET ct.title = $title
        RETURN ct
        `,
          { trialId, title: updateClinicalTrialDto.title },
        )
        .run();
    }

    if (updateClinicalTrialDto.summary) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
        MATCH (ct:ClinicalTrial {id: $trialId})
        SET ct.summary = $summary
        RETURN ct
        `,
          { trialId, summary: updateClinicalTrialDto.summary },
        )
        .run();
    }

    if (updateClinicalTrialDto.currentEnrollmentCount) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
        MATCH (ct:ClinicalTrial {id: $trialId})
        SET ct.currentEnrollmentCount = $currentEnrollmentCount
        RETURN ct
        `,
          {
            trialId,
            currentEnrollmentCount:
              updateClinicalTrialDto.currentEnrollmentCount,
          },
        )
        .run();
    }

    if (updateClinicalTrialDto.phase) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
        MATCH (ct:ClinicalTrial {id: $trialId})
        SET ct.phase = $phase
        RETURN ct
        `,
          { trialId, phase: updateClinicalTrialDto.phase },
        )
        .run();
    }

    if (updateClinicalTrialDto.type) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
        MATCH (ct:ClinicalTrial {id: $trialId})
        SET ct.type = $type
        RETURN ct
        `,
          { trialId, type: updateClinicalTrialDto.type },
        )
        .run();
    }

    if (updateClinicalTrialDto.status) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
        MATCH (ct:ClinicalTrial {id: $trialId})
        SET ct.status = $status
        RETURN ct
        `,
          { trialId, status: updateClinicalTrialDto.status },
        )
        .run();
    }

    if (updateClinicalTrialDto.sponsor) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})-[:SPONSORED_BY]->(sponsor:Sponsor)
          SET sponsor.name = $sponsorName
          RETURN sponsor
          `,
          { trialId, sponsorName: updateClinicalTrialDto.sponsor.name },
        )
        .run();
    }

    if (updateClinicalTrialDto.organization) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
        MATCH (ct:ClinicalTrial {id: $trialId})
        SET ct.organization = $organization
        RETURN ct
        `,
          { trialId, organization: updateClinicalTrialDto.organization },
        )
        .run();
    }

    if (updateClinicalTrialDto.contacts) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})-[r:HAS_CONTACT]->(c:Contact)
          DELETE r, c
          `,
          { trialId },
        )
        .run();

      for (const contact of updateClinicalTrialDto.contacts) {
        await this.neo4jService
          .initQuery()
          .raw(
            `
            MATCH (ct:ClinicalTrial {id: $trialId})
            CREATE (newContact:Contact {id: randomUUID(), name: $name, email: $email, phone: $phone, isMainContact: $isMainContact})
            MERGE (ct)-[:HAS_CONTACT]->(newContact)
            `,
            {
              trialId,
              name: contact.name,
              email: contact.email,
              phone: contact.phone,
              isMainContact: contact.isMainContact,
            },
          )
          .run();
      }
    }

    if (updateClinicalTrialDto.collaborators) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})-[r:HAS_COLLABORATOR]->(c:Collaborator)
          DELETE r, c
          `,
          { trialId },
        )
        .run();

      for (const collaborator of updateClinicalTrialDto.collaborators) {
        await this.neo4jService
          .initQuery()
          .raw(
            `
            MATCH (ct:ClinicalTrial {id: $trialId})
            CREATE (newCollaborator:Collaborator {id: randomUUID(), name: $name})
            MERGE (ct)-[:HAS_COLLABORATOR]->(newCollaborator)
            `,
            {
              trialId,
              name: collaborator.name,
            },
          )
          .run();
      }
    }

    if (updateClinicalTrialDto.conditions) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})-[r:STUDIES_CONDITION]->(c:Condition)
          DELETE r, c
          `,
          { trialId },
        )
        .run();

      for (const condition of updateClinicalTrialDto.conditions) {
        await this.neo4jService
          .initQuery()
          .raw(
            `
            MATCH (ct:ClinicalTrial {id: $trialId})
            CREATE (newCondition:Condition {id: randomUUID(), name: $name})
            MERGE (ct)-[:STUDIES_CONDITION]->(newCondition)
            `,
            {
              trialId,
              name: condition.name,
            },
          )
          .run();
      }
    }

    if (updateClinicalTrialDto.dates) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})-[r:HAS_DATES]->(d:ClinicalTrialDates)
          DELETE r, d
          `,
          { trialId },
        )
        .run();

      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})
          CREATE (newDates:ClinicalTrialDates {id: randomUUID(), startDate: $startDate, estimatedCompletionDate: $estimatedCompletionDate, lastUpdated: datetime(), firstFetched : datetime()})
          MERGE (ct)-[:HAS_DATES]->(newDates)
          `,
          {
            trialId,
            startDate: updateClinicalTrialDto.dates.startDate,
            estimatedCompletionDate:
              updateClinicalTrialDto.dates.estimatedCompletionDate,
          },
        )
        .run();
    }

    if (updateClinicalTrialDto.eligibility) {
      console.log(updateClinicalTrialDto.eligibility);
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})-[r:HAS_ELIGIBILITY]->(e:Eligibility)
          DELETE r, e
          `,
          { trialId },
        )
        .run();

      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})
          CREATE (newEligibility:Eligibility {id: randomUUID(), eligibilityCriteria: $eligibilityCriteria, gender : $gender, minAge: $minAge, maxAge: $maxAge})
          MERGE (ct)-[:HAS_ELIGIBILITY]->(newEligibility)
          `,
          {
            trialId,
            eligibilityCriteria:
              updateClinicalTrialDto.eligibility.eligibilityCriteria,
            gender: updateClinicalTrialDto.eligibility.gender,
            minAge: updateClinicalTrialDto.eligibility.minAge,
            maxAge: updateClinicalTrialDto.eligibility.maxAge,
          },
        )
        .run();
    }

    if (updateClinicalTrialDto.interventions) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})-[r:USES_INTERVENTION]->(i:Intervention)
          DELETE r, i
          `,
          { trialId },
        )
        .run();

      for (const intervention of updateClinicalTrialDto.interventions) {
        await this.neo4jService
          .initQuery()
          .raw(
            `
            MATCH (ct:ClinicalTrial {id: $trialId})
            CREATE (newIntervention:Intervention {id: randomUUID(), name: $name, description: $description, type: $type})
            MERGE (ct)-[:USES_INTERVENTION]->(newIntervention)
            `,
            {
              trialId,
              name: intervention.name,
              description: intervention.description,
              type: intervention.type,
            },
          )
          .run();
      }
    }

    if (updateClinicalTrialDto.locations) {
      await this.neo4jService
        .initQuery()
        .raw(
          `
          MATCH (ct:ClinicalTrial {id: $trialId})-[r:LOCATED_AT]->(l:Location)
          DELETE r, l
          `,
          { trialId },
        )
        .run();

      for (const location of updateClinicalTrialDto.locations) {
        await this.neo4jService
          .initQuery()
          .raw(
            `
            MATCH (ct:ClinicalTrial {id: $trialId})
            CREATE (newLocation:Location {id: randomUUID(), country: $country, city: $city, facility: $facility, latitude: $latitude, longitude: $longitude})
            MERGE (ct)-[:LOCATED_AT]->(newLocation)
            `,
            {
              trialId,
              country: location.country,
              city: location.city,
              facility: location.facility,
              latitude: location.latitude,
              longitude: location.longitude,
            },
          )
          .run();
      }
    }

    const clinicalTrial =
      await this.clinicalTrialsRepository.getClinicalTrial(trialId);

    return clinicalTrial;
  }
}
