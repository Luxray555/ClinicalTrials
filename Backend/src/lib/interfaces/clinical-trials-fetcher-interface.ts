import { RunEtlPipelineDto } from "@/etl-pipeline/dto/run-etl-pipeline.dto";
import { LoggerService } from "@/logger/logger.service";
import { Neo4jService } from "@/neo4j/neo4j.service";
import { DataSourceName } from "../types/data-model";


export interface BaseResult {
    nextPageToken?: any;
}

export interface IClinicalTrialsFetcher {
    sourceName: DataSourceName;
    studiesPerPage: number;

    fetchPage(
        pageIdentificator?: any,
        query?: RunEtlPipelineDto
    ): Promise<BaseResult & Record<string, any>>

    determineStartPageToken(runPipelineDto: RunEtlPipelineDto, numberOfpagesToSkip: number): Promise<any>;
    // buildClinicalTrialsQuery(runPipelineDto: RunEtlPipelineDto): string;


}

