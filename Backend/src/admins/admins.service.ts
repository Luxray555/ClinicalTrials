import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcryptjs';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from '@/lib/types/admin/admin';
import { Account } from '@/lib/types/account/account';
import { Doctor } from '@/lib/types/doctor/doctor';
import { Patient } from '@/lib/types/patient/patient';
import { SystemStats } from '@/lib/types/admin/stats';
import { buildCronExpression, getNextSyncDate } from '@/lib/utils/common';
import { updateScheduleDto } from './dto/update-schedule.dto';
import { LoggerService } from '@/logger/logger.service';
import { LogEventType } from '@/logger/entities/log-record-entity';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { EtlPipelineService } from '@/etl-pipeline/etl-pipeline.service';

@Injectable()
export class AdminsService {
  constructor(private readonly neo4jService: Neo4jService,
    private readonly loggerService: LoggerService,
    private schedulerRegistry: SchedulerRegistry,
    private readonly etlPipelineService: EtlPipelineService
  ) { }

  async createAdmin(
    createAdminDto: CreateAdminDto,
  ): Promise<{ admin: Admin; account: Account }> {
    const existingAccount = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        WHERE account.email = $email
        RETURN account
        `,
        { email: createAdminDto.email },
      )
      .run();

    if (existingAccount.length) {
      throw new HttpException('Admin account already exists', 409);
    }

    if (createAdminDto.password) {
      createAdminDto.password = await bcrypt.hash(createAdminDto.password, 10);
    }

    const { email, password, ...rest } = createAdminDto;
    const id = uuidv4();

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        CREATE (admin:Admin { id: $id, firstName: $adminProps.firstName, lastName: $adminProps.lastName, image: $adminProps.image })-[:HAS_ACCOUNT]->(account:Account { id: $id, email: $email, password: $password, role: 'ADMIN', isBlocked: false })
        RETURN admin, account
        `,
        {
          id,
          adminProps: rest,
          email,
          password,
        },
      )
      .run();

    return {
      admin: {
        ...result[0].admin.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async findOneAdminById(
    id: string,
  ): Promise<{ admin: Admin; account: Account }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (admin:Admin)-[:HAS_ACCOUNT]->(account:Account { id: $id })
        RETURN admin, account
        `,
        { id },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Admin #${id} not found`);
    }

    return {
      admin: {
        ...result[0].admin.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async getAllDataCollectionLogContexts(
    page: number = 1,
    pageSize: number = 10,
    type: string = null,
  ): Promise<any> {

    const logContexts = await this.loggerService.getAllLogContexts(page, pageSize, type as LogEventType)

    return {
      pagination: logContexts.pagination,
      logs: logContexts.data
    }




  }


  async findAllDoctors(): Promise<{ doctor: Doctor; account: Account }[]> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (doctor:Doctor)-[:HAS_ACCOUNT]->(account:Account)
        RETURN doctor, account
        `,
      )
      .run();

    return result.map((record) => ({
      doctor: {
        ...result[0].admin.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    }));
  }

  async findAllPatients(): Promise<{ patient: Patient; account: Account }[]> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (patient:Patient)-[:HAS_ACCOUNT]->(account:Account)
        RETURN patient, account
        `,
      )
      .run();

    return result.map((record) => ({
      patient: {
        ...result[0].admin.properties,
      },
      account: {
        ...result[0].account.properties,
      },
    }));
  }

  async findAllUsers(page: number = 1, pageSize: number = 10, role?: string): Promise<any> {
    console.log('page', page)
    console.log('pageSize', pageSize)
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        MATCH (user)-[:HAS_ACCOUNT]->(account)
        ${role ? `WHERE account.role = "${role}"` : ""}
        RETURN account, user 
        SKIP ${((page - 1) * pageSize)} LIMIT ${pageSize}
        `,
      )
      .run();

    const count = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        MATCH (user)-[:HAS_ACCOUNT]->(account)
        ${role ? `WHERE account.role = "${role}"` : ""}

        RETURN count(user) as total
        `,
      )
      .run();

    const record = count[0];

    const finalRes = {
      pagination: {
        total: record.total,
        totalPages: Math.ceil(record.total / pageSize),
        page: page,
        pageSize: pageSize,
      }, users: result.map((record) => {
        const { password, refreshToken, ...accountSafe } = record.account.properties;
        const { password: userPass, refreshToken: userToken, ...userSafe } = record.user.properties;

        return {
          ...accountSafe,
          ...userSafe,
        };
      })
    }
    console.log('finalRes', finalRes)
    return finalRes



  }


  async deleteUser(id: string): Promise<any> {
    console.log('id in delte', id)

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
      MATCH (user)-[:HAS_ACCOUNT]->(account:Account { id: $id })
      DETACH DELETE account , user
      RETURN account
      `,
        { id },
      )
      .run();
    return {
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async deleteClinicalTrial(id: string): Promise<any> {

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
      MATCH (trial:ClinicalTrial { id: $id })
      optional MATCH (trial)-[:HAS_METADATA]->(metadata:ClinicalTrialMetaData)
      optional Match (trial)-[:HAS_ELIGIBILITY]->(el)
      optional MATCH (trial)-[:HAS_CONTACT]->(contact)
       optional MATCH (trial)-[:USES_INTERVENTION]->(intervention)
      optional MATCH (trial)-[:SPONSORED_BY]->(sponsor)
      DETACH DELETE trial , metadata , el , contact , intervention,sponsor
      RETURN trial
      `,
        { id },
      )
      .run();


    if (!result.length) {
      throw new NotFoundException(`Clinical trial #${id} not found`);
    }

    return {
      trial: {
        ...result[0]?.trial?.properties,
      },
    };
  }


  async blockUser(id: string): Promise<{ account: Account }> {
    const account = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account { id: $id })
        RETURN account
        `,
        { id },
      )
      .run();

    if (!account.length) {
      throw new NotFoundException(`User #${id} not found`);
    }

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account { id: $id })
        SET account.isBlocked = true
        RETURN account
        `,
        { id },
      )
      .run();

    return {
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async unblockUser(id: string): Promise<{ account: Account }> {
    const account = await this.neo4jService
      .initQuery()
      .raw(
        `
      MATCH (account:Account { id: $id })
      RETURN account
      `,
        { id },
      )
      .run();

    if (!account.length) {
      throw new NotFoundException(`User #${id} not found`);
    }

    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
      MATCH (account:Account { id: $id })
      SET account.isBlocked = false
      RETURN account
      `,
        { id },
      )
      .run();

    return {
      account: {
        ...result[0].account.properties,
      },
    };
  }

  async getAllDataSources(page: number = 1, pageSize: number = 10): Promise<any> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (source:DataSource)
        match (source)-[:HAS_SCHEDULE]->(schedule)
        RETURN source , schedule
        SKIP ${((page - 1) * pageSize)} LIMIT ${pageSize}
        `,
      )
      .run();

    const count = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (source:DataSource)
        RETURN count(source) as total
        `,
      )
      .run();

    const record = count[0];


    const finalRes = {
      pagination: {
        total: record.total - 1,
        totalPages: Math.ceil((record.total - 1) / pageSize),
        page: page,
        pageSize: pageSize,
      }, dataSources: result.map((record) => {
        return {
          schedule: { nextSync: getNextSyncDate(record.schedule.properties), ...record.schedule.properties },
          ...record.source.properties,

        };
      })
    }
    return finalRes

  }

  async getDataSourceDetails(
    sourceId: string,
    page: number = 1,
    pageSize: number = 10,
    type: string = null
  ): Promise<{ source: any }> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
       MATCH (source:DataSource { id: $sourceId })
        where source.id = $sourceId
        optional MATCH (trial:ClinicalTrial)-[:HAS_METADATA]->(metadata:ClinicalTrialMetaData)-[:FROM_SOURCE]->(source)
        optional match (source)-[:HAS_SCHEDULE]->(schedule)
        RETURN 
          source,
          schedule , 
          COUNT(trial) AS totalTrials
        `,
        { sourceId },
      )
      .run();



    if (!result.length) {
      throw new NotFoundException(`Data source #${sourceId} not found`);
    }
    const { source, schedule, ...rest } = result[0]
    const nextSyncDate = getNextSyncDate(schedule.properties)

    // get the log contexts . 
    const logContexts = await this.loggerService.getLogContextsBySourceName(source.properties.name, page, pageSize, type as LogEventType)



    return {
      schedule: { nextSync: nextSyncDate, ...schedule.properties },
      ...rest,
      ...source.properties,
      historyLogs:
        logContexts
    };
  }


  async updateSchedule(
    sourceId: string,
    body: updateScheduleDto,
  ): Promise<any> {
    const result = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (source:DataSource { id: $sourceId })
        MATCH (source)-[:HAS_SCHEDULE]->(schedule)
        WHERE source.id = $sourceId
        SET schedule = $schedule
        RETURN source
        `,
        { sourceId, schedule: body },
      )
      .run();

    if (!result.length) {
      throw new NotFoundException(`Data source #${sourceId} not found`);
    }

    const source = result[0].source.properties;

    const jobs = this.schedulerRegistry.getCronJobs();
    // search if the jobs has a key of source.slug , if yes delete it 
    jobs.forEach((value, key, map) => {
      let next: string | Date;
      try {
        if (key == source.slug) {
          console.log('deleting the job for this source', key)
          this.schedulerRegistry.deleteCronJob(key);
        }
        next = value.nextDate().toJSDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
    });

    const cronExpression = buildCronExpression(body)
    console.log('cronExpression', cronExpression);
    // const job = new CronJob("*/10 * * * * *", () => {
    const job = new CronJob(cronExpression, () => {

      this.etlPipelineService.refreshDataSource(source.slug)


    });
    // add the new cron job for this source
    this.schedulerRegistry.addCronJob(source.slug, job);
    job.start();

    return {
      source: {
        ...result[0].source.properties,
      },
    };
  }



  async getSystemStats(): Promise<SystemStats> {
    // Get user statistics
    const usersStats = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (account:Account)
        RETURN 
          COUNT(CASE WHEN account.role = 'DOCTOR' THEN 1 END) AS doctors,
          COUNT(CASE WHEN account.role = 'PATIENT' THEN 1 END) AS patients,
          COUNT(CASE WHEN account.role = 'INVESTIGATOR' THEN 1 END) AS investigators,
          COUNT(CASE WHEN account.role = 'ADMIN' THEN 1 END) AS admins,
          COUNT(account) AS total
        `,
      )
      .run();

    // Get clinical trials statistics by status
    const clinicalTrialsStats = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (trial:ClinicalTrial)
        RETURN 
          COUNT(trial) AS total,
          COUNT(CASE WHEN trial.status = 'COMPLETED' THEN 1 END) AS completed,
          COUNT(CASE WHEN trial.status = 'NOT_YET_RECRUITING' THEN 1 END) AS notYetRecruiting,
          COUNT(CASE WHEN trial.status = 'RECRUITING' THEN 1 END) AS recruiting,
          COUNT(CASE WHEN trial.status = 'UNKNOWN' THEN 1 END) AS unknown,
          COUNT(CASE WHEN trial.status = 'WITHDRAWN' THEN 1 END) AS withdrawn,
          COUNT(CASE WHEN trial.status = 'TERMINATED' THEN 1 END) AS terminated,
          COUNT(CASE WHEN trial.status = 'SUSPENDED' THEN 1 END) AS suspended
        `,
      )
      .run();

    // Get data sources statistics by type
    const dataSourcesStats = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (source:DataSource)
        RETURN 
          COUNT(DISTINCT source) AS total,
          COUNT(DISTINCT CASE WHEN source.type = 'API' THEN source END) AS api,
          COUNT(DISTINCT CASE WHEN source.type = 'Website Scraper' THEN source END) AS webScraper,
          COUNT(DISTINCT CASE WHEN source.type = 'INVESTIGATOR' THEN source END) AS investigators
        `,
      )
      .run();

    // Get trials per source data
    const trialsPerSource = await this.neo4jService
      .initQuery()
      .raw(
        `
        MATCH (trial:ClinicalTrial)-[:HAS_METADATA]->(metadata:ClinicalTrialMetaData)-[:FROM_SOURCE]->(source:DataSource)
        RETURN 
          COUNT(DISTINCT source) AS total,
          COUNT(DISTINCT CASE WHEN source.type = 'API' THEN trial END) AS apiTrials,
          COUNT(DISTINCT CASE WHEN source.type = 'Website Scraper' THEN trial END) AS webScraperTrials,
          COUNT(DISTINCT CASE WHEN source.type = 'INVESTIGATOR' THEN trial END) AS investigatorsTrials
        `
      )
      .run();

    // Map clinical trials data to the format expected by the frontend
    const trialsData = [
      { status: "COMPLETED", count: clinicalTrialsStats[0].completed || 0 },
      { status: "NOT_YET_RECRUITING", count: clinicalTrialsStats[0].notYetRecruiting || 0 },
      { status: "RECRUITING", count: clinicalTrialsStats[0].recruiting || 0 },
      { status: "UNKNOWN", count: clinicalTrialsStats[0].unknown || 0 },
      { status: "WITHDRAWN", count: clinicalTrialsStats[0].withdrawn || 0 },
      { status: "TERMINATED", count: clinicalTrialsStats[0].terminated || 0 },
      { status: "SUSPENDED", count: clinicalTrialsStats[0].suspended || 0 },
    ];

    // Map data sources to a list format similar to clinical trials
    const dataSourcesList = [
      {
        type: "API",
        count: dataSourcesStats[0].api || 0,
        trialsCount: trialsPerSource[0].apiTrials || 0
      },
      {
        type: "Website Scraper",
        count: dataSourcesStats[0].webScraper || 0,
        trialsCount: trialsPerSource[0].webScraperTrials || 0
      },
      {
        type: "INVESTIGATOR",
        count: dataSourcesStats[0].investigators || 0,
        trialsCount: trialsPerSource[0].investigatorsTrials || 0
      },
    ];

    return {
      users: {
        doctors: usersStats[0].doctors || 0,
        patients: usersStats[0].patients || 0,
        investigators: usersStats[0].investigators || 0,
        admins: usersStats[0].admins || 0,
        total: usersStats[0].total || 0,
      },
      clinicalTrials: {
        total: clinicalTrialsStats[0].total || 0,
        statusDistribution: trialsData,
      },
      dataSources: {
        total: dataSourcesStats[0].total || 0,
        typeDistribution: dataSourcesList,
      },
    };
  }

}

