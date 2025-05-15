// // import { HttpException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
// // import { IClinicalTrialsFetcher } from "@/lib/interfaces/clinical-trials-fetcher-interface";
// // import { ClinicalTrialsService } from "@/clinical-trials/clinical-trials.service";
// // import { IClinicalTrialsTransformer } from "@/lib/interfaces/clinical-trials-transformer-interface";
// // import { ClinicalTrial, ClinicalTrialStatusEnum } from "@/lib/types/data-model";
// // import { RunEtlPipelineDto } from "@/etl-pipeline/dto/run-etl-pipeline.dto";
// // import { ClinicalTrialsGovFetcher } from "@/etl-pipeline/fetchers/clinical-trials-gov-api/clinical-trials-gov.fetcher";
// // import { ClinicalTrialsGovTransformer } from "@/etl-pipeline/transformers/clinical-trials-gov.transformer";
// // import { formatTime, retryWithBackoff } from "@/lib/utils/common";
// // import { LoggerService } from "@/logger/logger.service";
// // import { LogEvent } from "@/logger/entities/log-record-entity";
// // import { UnicancerFetcher } from "@/etl-pipeline/fetchers/unicancer-website/unicancer.fetcher";
// // import { UnicancerTransformer } from "@/etl-pipeline/transformers/unicaner.transformer";
// // import { CancerFrFetcher } from "@/etl-pipeline/fetchers/cancer-fr-website/cancer-fr.fetcher";
// // import { CancerFrTransformer } from "@/etl-pipeline/transformers/cancer-fr.transformer";

// // // export class DataRefreshService implements OnModuleInit {
// // @Injectable()
// // export class DataRefreshService {

// //     constructor(private readonly clinicalTrialService: ClinicalTrialsService,
// //         private readonly loggerService: LoggerService
// //     ) { }


// //     async runScheduler() {
// //         const start = Date.now();
// //         console.log("Starting Data Refresh Scheduler at:", formatTime(start));

// //         const params: RunEtlPipelineDto = {
// //             status: [ClinicalTrialStatusEnum.RECRUITING],
// //         };

// //         const DataSources: { fetcher: IClinicalTrialsFetcher, transformer: IClinicalTrialsTransformer }[] = [
// //             { fetcher: new ClinicalTrialsGovFetcher(), transformer: new ClinicalTrialsGovTransformer() },
// //             { fetcher: new UnicancerFetcher(), transformer: new UnicancerTransformer() },
// //             { fetcher: new CancerFrFetcher(), transformer: new CancerFrTransformer() }
// //         ];

// //         await Promise.all(DataSources.map(source => this.processSource(source.fetcher, source.transformer, params)));

// //         const end = Date.now();
// //         console.log("Data Refresh Scheduler completed at:", formatTime(end));

// //         const totalSeconds = ((end - start) / 1000).toFixed(2); // Converts milliseconds to seconds
// //         console.log(`Total time taken: ${totalSeconds} seconds`);
// //     }

//     private async processSource(
//         fetcher: IClinicalTrialsFetcher,
//         transformer: IClinicalTrialsTransformer,
//         params?: RunEtlPipelineDto
//     ) {
//         try {
//             console.log(`Starting Data refresh for fetcher: ${fetcher.sourceName}`);
//             const logContext = await this.loggerService.getLogContext(fetcher.sourceName, params, LogEvent.DATA_REFRESHING);
//             const lastSucessfulLog = await this.loggerService.getLastSuccesfullLog(logContext);
//             //! uncomment these later
//             let nextToken = lastSucessfulLog?.logInformation;

//             // !uncomment these later
//             if (nextToken === LogEvent.DONE) {
//                 return "Data Refreshing is already done";
//             }

//             while (true) {
//                 console.log(`Fetching page ${nextToken ? ` ${nextToken}` : "1"} for ${fetcher.sourceName}`);
//                 // const trialsBatch = await fetcher.fetchPage(nextToken, params);
//                 const trialsBatch = await retryWithBackoff(() =>
//                     fetcher.fetchPage(nextToken, params)
//                 );

//                 const transformedBatch = transformer.transformClinicalTrialsData(trialsBatch);
//                 console.log("start of processing page")
//                 await Promise.all(transformedBatch.map(trial => this.processClinicalTrial(trial)));
//                 console.log("end of processing page")
//                 // Log progress
//                 const logEventType = trialsBatch.nextPageToken ? LogEvent.DATA_REFRESHING : LogEvent.DONE;
//                 nextToken = trialsBatch.nextPageToken || LogEvent.NO_MORE_DATA_TO_REFRESH;

//                 await retryWithBackoff(() =>
//                     this.loggerService.insertLastSuccesfullLog({
//                         logInformation: nextToken,
//                         logEventType,
//                         logContextId: logContext.id,
//                     })
//                 );

//                 if (nextToken === LogEvent.NO_MORE_DATA_TO_REFRESH) break;
//             }

//             console.log(`Finished processing fetcher: ${fetcher.sourceName}`);

//         } catch (error) {
//             console.log(`Error processing fetcher ${fetcher.sourceName}: ${error}`);
//             // throw error;
//             throw new HttpException(
//                 {
//                     status: 500,
//                     error: "Internal Server Error",
//                     message: "Max retries reached",
//                 },
//                 500,
//             );
//         }
//     }

// //     public async refreshDataSource(slug: string) {
// //         const fetcher = this.getFetcherBySlug(slug);
// //         const transformer = this.getTransformerBySlug(slug);
// //         const params: RunEtlPipelineDto = {
// //             status: [ClinicalTrialStatusEnum.RECRUITING],
// //         };
// //         await this.processSource(fetcher, transformer, params);
// //     }

//     private getFetcherBySlug(slug: string): IClinicalTrialsFetcher {
//         switch (slug) {
//             case 'clinical-trials-gov':
//                 return new ClinicalTrialsGovFetcher();
//             case 'unicancer':
//                 return new UnicancerFetcher();
//             case 'cancer-fr':
//                 return new CancerFrFetcher();
//             default:
//                 throw new Error(`Unknown slug: ${slug}`);
//         }
//     }

//     private getTransformerBySlug(slug: string): IClinicalTrialsTransformer {
//         switch (slug) {
//             case 'clinical-trials-gov':
//                 return new ClinicalTrialsGovTransformer();
//             case 'unicancer':
//                 return new UnicancerTransformer();
//             case 'cancer-fr':
//                 return new CancerFrTransformer();
//             default:
//                 throw new Error(`Unknown slug: ${slug}`);
//         }
//     }


// //     private async processClinicalTrial(trial: ClinicalTrial) {
// //         // console.log('trial', trial)
// //         try {
// //             const existingTrial = await this.clinicalTrialService.findOneByOriginalTrialId(trial?.sourceMetaData?.originalSourceId);
// //             // console.log('existingTrial', existingTrial)
// //             if (!existingTrial || trial.dates?.lastUpdatedOnSource > existingTrial.dates?.lastUpdated || !trial.dates) {
// //                 await this.clinicalTrialService.updateOrCreate(trial);
// //             }
// //         } catch (error) {
// //             console.error(`Error processing trial ${trial?.sourceMetaData?.originalSourceId}: ${error.message}`);
// //         }
// //     }

// // }
