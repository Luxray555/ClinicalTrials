import { PostgresService } from '@/postgres/postgres.service';
import { Injectable } from '@nestjs/common';
import { LogEvent, logRecord } from './entities/log-record-entity';
import { LogContext, LogEventType } from '@prisma/client';
import { DataSourceName } from '@/lib/types/data-model';
import { RunEtlPipelineDto } from '@/etl-pipeline/dto/run-etl-pipeline.dto';
import { LogInOptions } from 'passport';
import { stringifyIfNumber } from '@/lib/utils/common';

@Injectable()
export class LoggerService {
    constructor(private readonly postgresService: PostgresService) { }

    async getLastSuccesfullLog(logContext: LogContext): Promise<logRecord> {
        return await this.postgresService.log.findFirst({
            where: {
                logContextId: logContext.id,
                // logEventType: {
                //     not: LogEvent.DONE
                // }
            },
            orderBy: {
                createdAt: 'desc', // Assuming createdAt is the field tracking creation time
            },
            select: {
                id: true,
                logInformation: true,
                logEventType: true,
                logContextId: true
            },
        });
    }

    async deleteRefreshLogContextsLogically(id: number) {
        return await this.postgresService.logContext.update({
            where: {
                id: id
            },
            data: {
                isDeleted: true
            }
        })
    }

    async insertLastSuccesfullLog(data: logRecord) {
        // insert log to db or file
        return await this.insertLogToDb(data);
    }

    async getLogContexts(sourceName: DataSourceName) {
        // get log context from db
        return await this.postgresService.logContext.findMany({
            where: {
                sourceName
            }
        });

    }

    async insertLogToDb(data: logRecord) {
        return await this.postgresService.log.create({
            data: {
                logContextId: data.logContextId,
                logInformation: stringifyIfNumber(data.logInformation),
                logEventType: data.logEventType,
            },
        });
        // insert log to db
    }


    async getLogContext(sourceName: DataSourceName, runPipelineDto: RunEtlPipelineDto, logEventType: LogEventType) {
        // Build the whereClause dynamically
        const whereClause: any = {
            sourceName,
            logEventType,
            isDeleted: false, // Assuming you want to exclude deleted records
            country: runPipelineDto.country !== undefined ? runPipelineDto.country : null,
            startYear: runPipelineDto.startYear !== undefined ? runPipelineDto.startYear : null,
            endYear: runPipelineDto.endYear !== undefined ? runPipelineDto.endYear : null,
            numberOfTrials: runPipelineDto.numberOfTrials !== undefined ? runPipelineDto.numberOfTrials : null,
            startingFrom: runPipelineDto.startingFrom !== undefined ? runPipelineDto.startingFrom : null,
        };

        // Add conditions only if it is defined and has elements
        if (runPipelineDto.conditions !== undefined && runPipelineDto.conditions.length > 0) {
            whereClause.conditions = { hasEvery: runPipelineDto.conditions };
        }
        if (runPipelineDto.status !== undefined && runPipelineDto.status.length > 0) {
            whereClause.status = { hasEvery: runPipelineDto.status };
        }


        // Check if a record already exists
        const existingRecord = await this.postgresService.logContext.findFirst({
            where: whereClause,
        });

        // If no record exists, create a new one
        if (!existingRecord) {
            return await this.postgresService.logContext.create({
                data: {
                    ...runPipelineDto,
                    sourceName,
                    logEventType,
                    createdAt: new Date(),

                },
            });
        }

        // Return the existing record
        return existingRecord;
    }

    async getNumberOfLogsByContextId(contextId: number) {

        return await this.postgresService.log.count(
            {
                where: {
                    logContextId: contextId,
                    logEventType: {
                        not: LogEvent.DONE
                    }
                }
            }
        )

    }
    async getLogContextsBySourceName(
        sourceName: DataSourceName,
        page: number = 1,
        pageSize: number = 10,
        type: LogEventType | null = null
    ) {
        const whereClause = {
            sourceName,
            ...(type && { logEventType: type }),
        };

        const [total, data] = await this.postgresService.$transaction([
            this.postgresService.logContext.count({
                where: whereClause,
            }),
            this.postgresService.logContext.findMany({
                where: whereClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return {
            data,
            pagination: {
                page,
                total,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }


    // async getLogContextsBySourceName(sourceName: DataSourceName, page: number = 1, pageSize: number = 10 , type: LogEventType | null = null) {
    //     const [total, data] = await this.postgresService.$transaction([
    //         this.postgresService.logContext.count({
    //             where: { sourceName },
    //         }),
    //         this.postgresService.logContext.findMany({
    //             where: { sourceName },
    //             skip: (page - 1) * pageSize,
    //             take: pageSize,
    //         }),
    //     ]);

    //     return {
    //         data,
    //         pagination:
    //         {
    //             page,
    //             total,
    //             pageSize,
    //             totalPages: Math.ceil(total / pageSize),
    //         }
    //     };
    // }

    async getAllLogContexts(page: number = 1, pageSize: number = 10, type: LogEventType | null = null) {
        const whereClause = type ? { logEventType: type } : {};

        const [total, data] = await this.postgresService.$transaction([
            this.postgresService.logContext.count({
                where: whereClause,
            }),
            this.postgresService.logContext.findMany({
                where: whereClause,
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ]);

        return {
            data,
            pagination: {
                page,
                total,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }



}