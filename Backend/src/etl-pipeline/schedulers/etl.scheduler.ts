// import { Injectable, Logger } from "@nestjs/common";
// import { Cron, CronExpression } from "@nestjs/schedule";
// import { ClinicalTrialsGovFetcher } from "../fetchers/clinical-trials-gov-api/clinical-trials-gov.fetcher";
// import { IClinicalTrialsFetcher } from "@/lib/interfaces/clinical-trials-fetcher-interface";
// import { ClinicalTrialsService } from "@/clinical-trials/clinical-trials.service";
// import { RunEtlPipelineDto } from "../dto/run-etl-pipeline.dto";
// import { IClinicalTrialsTransformer } from "@/lib/interfaces/clinical-trials-transformer-interface";
// import { ClinicalTrialsGovTransformer } from "../transformers/clinical-trials-gov.transformer";
// import { ClinicalTrial, ClinicalTrialStatusEnum } from "@/lib/types/data-model";

// @Injectable()
// export class DataRefreshScheduler {

//     // todo : add the fetcher and transformer to the constructor
//     // todo : add the nextpageToken in each fetcher.
//     // todoOrtoKnow : the pipeline will run once in a lifeTime maybe . after that the refresher will CreateOrUpdate.



//     private readonly logger = new Logger(DataRefreshScheduler.name);

//     constructor(private readonly clinicalTrialService: ClinicalTrialsService) { }

//     @Cron(CronExpression.EVERY_10_SECONDS)
//     handleCron() {
//         console.log("30sec")
//     }


//     @Cron(CronExpression.EVERY_10_SECONDS)
//     async runScheduler() {
//         this.logger.log("Starting Data Refresh Scheduler...");
//         const params: RunEtlPipelineDto = { country: "France", status: [ClinicalTrialStatusEnum.RECRUITING] };

//         const DataSources: { fetcher: IClinicalTrialsFetcher, transformer: IClinicalTrialsTransformer }[] = [
//             { fetcher: new ClinicalTrialsGovFetcher(), transformer: new ClinicalTrialsGovTransformer() }
//         ];

//         // Run each fetcher in parallel
//         await Promise.all(DataSources.map(source => this.processSource(source.fetcher, source.transformer, params)));

//         this.logger.log("Data Refresh Scheduler completed.");
//     }

//     private async processSource(fetcher: IClinicalTrialsFetcher, transformer: IClinicalTrialsTransformer, params: RunEtlPipelineDto) {
//         this.logger.log(`Processing fetcher: ${fetcher.sourceName}`);

//         let startFrom: any;

//         while (true) {
//             this.logger.log(`Fetching page ${startFrom ? startFrom : 1} from ${fetcher.sourceName}...`);

//             const trialsBatch = await fetcher.fetchPage(startFrom, params);

//             const transformedBatch = transformer.transformClinicalTrialsData(trialsBatch)
//             if (!transformedBatch || transformedBatch.length === 0) break;

//             // Process each trial in the batch
//             await Promise.all(transformedBatch.map(trial => this.processClinicalTrial(trial)));
//             startFrom = trialsBatch.nextPageStart; // Move to the next page
//             if (!startFrom) break;
//         }

//         this.logger.log(`Finished processing fetcher: ${fetcher.sourceName}`);
//     }

//     private async processClinicalTrial(trial: ClinicalTrial) {
//         try {

//             const existingTrial = await this.clinicalTrialService.findOneByOriginalTrialId(trial?.sourceMetaData?.originalSourceId);

//             if (!existingTrial || trial.dates.lastUpdatedOnSource > existingTrial.dates.lastUpdated) {
//                 await this.clinicalTrialService.updateOrCreate(trial);
//                 this.logger.log(`Updated trial: ${trial?.sourceMetaData?.originalSourceId}`);
//             }
//         } catch (error) {
//             this.logger.error(`Error processing trial ${trial?.sourceMetaData?.originalSourceId}: ${error.message}`);
//         }
//     }
// }

// // it is easy for each clinical trial from source get its lastUpdated^originalTrialId , and compare it with what we have
// // in our database, if it is greater than what we have in our database, we update it.
// //todo : add a function of findByOriginalSourceId to the clinicalTrialsService.