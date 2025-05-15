import { BadRequestException, forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateEtlPipelineDto } from './dto/create-etl-pipeline.dto';
import { UpdateEtlPipelineDto } from './dto/update-etl-pipeline.dto';
import { Neo4jLoader } from './loaders/neo4j.loader';
import { Neo4jService } from '@/neo4j/neo4j.service';
import { ClinicalTrialsGovFetcher } from './fetchers/clinical-trials-gov-api/clinical-trials-gov.fetcher';
import { LoggerService } from '@/logger/logger.service';
import { RunEtlPipelineDto } from './dto/run-etl-pipeline.dto';
import { LogEvent } from '@/logger/entities/log-record-entity';
import { IClinicalTrialsFetcher } from '@/lib/interfaces/clinical-trials-fetcher-interface';
import { ClinicalTrialsGovTransformer } from './transformers/clinical-trials-gov.transformer';
import { IClinicalTrialsLoader } from '@/lib/interfaces/clinical-trials-loader-interface';
import { IClinicalTrialsTransformer } from '@/lib/interfaces/clinical-trials-transformer-interface';
import { formatTime, retryWithBackoff } from '@/lib/utils/common';
import { UnicancerFetcher } from './fetchers/unicancer-website/unicancer.fetcher';
import { UnicancerTransformer } from './transformers/unicaner.transformer';
import { CancerFrFetcher } from './fetchers/cancer-fr-website/cancer-fr.fetcher';
import { CancerFrTransformer } from './transformers/cancer-fr.transformer';
import { MyGateway } from '@/gateway/gateway';
import { ClinicalTrial, ClinicalTrialStatusEnum } from '@/lib/types/data-model';
import { ClinicalTrialsService } from '@/clinical-trials/clinical-trials.service';
import { Interval } from '@nestjs/schedule';
import { log } from 'console';
import { EmbeddingService } from '@/embedding/embedding.service';

@Injectable()
export class EtlPipelineService {
  collectionPipelines: Record<string, string> = {};
  refreshPipelines: Record<string, string> = {};

  runningPipelines: String[] = [];
  stoppedPipelines: String[] = [];

  constructor(
    private readonly neo4jService: Neo4jService,
    private readonly loggerService: LoggerService, // Inject the logger service
    @Inject(forwardRef(() => MyGateway))
    private readonly gateway: MyGateway,
    private readonly clinicalTrialService: ClinicalTrialsService,
    private readonly embeddingService: EmbeddingService
  ) { }



  @Interval(100) // 👈 every 10 seconds
  async handleClinicalTrialsCountUpdate() {
    try {
      const countBySource = await this.clinicalTrialService.getTotalTrialsForAllSources();
      this.gateway.TotalTrialsForAllSources(countBySource);
    } catch (error) {
      console.error("Error fetching clinical trials count:", error);
    }
  }
  // async runUnicancerPipeline(runPipelineDto: RunEtlPipelineDto) {
  //   console.log("Starting UnicancerPipeline ...")
  //   const fetcher = new UnicancerFetcher();
  //   const transformer = new UnicancerTransformer();
  //   const loader = new Neo4jLoader(this.neo4jService);
  //   this.runPipeline(runPipelineDto, fetcher, transformer, loader).then(() => {
  //     console.log("UnicancerPipeline started successfully");
  //   }
  //   ).catch((error) => {
  //     console.error("Error starting UnicancerPipeline:", error);
  //   });
  // }

  // stopCancerFrPipeline() {
  //   const fetcher = new CancerFrFetcher();
  //   this.stopPipeline(fetcher);
  //   return "Stopping the pipeline request has been sent, the pipeline is stopping ,  wait for the pipeline to finish loading the current page , and reach a stable state";
  // }


  // async runCancerFrPipeline(runPipelineDto: RunEtlPipelineDto) {
  //   console.log("Starting CancerFrPipeline ...")
  //   const fetcher = new CancerFrFetcher();
  //   const transformer = new CancerFrTransformer();
  //   const loader = new Neo4jLoader(this.neo4jService);
  //   this.runPipeline(runPipelineDto, fetcher, transformer, loader).then(() => {
  //     console.log("CancerFrPipeline started successfully");
  //   }
  //   ).catch((error) => {
  //     console.error("Error starting CancerFrPipeline:", error);
  //   });
  // }

  // stopUnicancerPipeline() {
  //   const fetcher = new UnicancerFetcher();
  //   this.stopPipeline(fetcher);
  //   return "Stopping the pipeline request has been sent, the pipeline is stopping ,  wait for the pipeline to finish loading the current page , and reach a stable state";
  // }


  // async runClinicalTrialsGovPipeline(runPipelineDto: RunEtlPipelineDto) {
  //   console.log("Starting ClinicalTrialsGovPipeline ...")
  //   const fetcher = new ClinicalTrialsGovFetcher();
  //   const transformer = new ClinicalTrialsGovTransformer();
  //   const loader = new Neo4jLoader(this.neo4jService);
  //   this.runPipeline(runPipelineDto, fetcher, transformer, loader).then(() => {
  //     console.log("ClinicalTrialsGovPipeline started successfully");
  //   }
  //   ).catch((error) => {
  //     console.error("Error starting ClinicalTrialsGovPipeline:", error);
  //   });
  //   return "ClinicalTrialsGovPipeline started successfully";
  // }

  // stopClinicalTrialsGovPipeline() {
  //   const fetcher = new ClinicalTrialsGovFetcher();
  //   this.stopPipeline(fetcher);
  //   return "Stopping the pipeline request has been sent, the pipeline is stopping ,  wait for the pipeline to finish loading the current page , and reach a stable state";
  // }


  emitRefreshPipelines(name: string, status: string) {
    this.refreshPipelines[name] = status;
    this.gateway.emitPipelinesStates({ refreshPipelines: this.refreshPipelines, collectionPipelines: this.collectionPipelines })
  }

  startPipeline(fetcher: IClinicalTrialsFetcher) {
    this.collectionPipelines[fetcher.sourceName] = "running"
    this.runningPipelines.push(fetcher.sourceName);
    this.stoppedPipelines = this.stoppedPipelines.filter(pipeline => pipeline !== fetcher.sourceName);

    this.gateway.emitPipelinesStates({ collectionPipelines: this.collectionPipelines, refreshPipelines: this.refreshPipelines })
  }

  stopPipeline(fetcher: IClinicalTrialsFetcher) {
    this.collectionPipelines[fetcher.sourceName] = "completed"

    this.stoppedPipelines.push(fetcher.sourceName);

    this.runningPipelines = this.runningPipelines.filter(pipeline => pipeline !== fetcher.sourceName);
    this.gateway.emitPipelinesStates({ collectionPipelines: this.collectionPipelines, refreshPipelines: this.refreshPipelines })

  }


  isPipelineRunning(fetcher: IClinicalTrialsFetcher) {
    return this.runningPipelines.includes(fetcher.sourceName)
  }

  isPipelineStopped(fetcher: IClinicalTrialsFetcher) {
    return this.stoppedPipelines.includes(fetcher.sourceName)
  }

  getRunningPipelines() {
    return { collectionPipelines: this.collectionPipelines, refreshPipelines: this.refreshPipelines };
  }

  getRefreshPipelines() {
    return this.refreshPipelines;
  }

  // Run any pipeline by injecting it
  async runPipeline(runPipelineDto: RunEtlPipelineDto, fetcher: IClinicalTrialsFetcher, transformer: IClinicalTrialsTransformer, loader: IClinicalTrialsLoader) {
    try {
      this.startPipeline(fetcher)
      let isDone: boolean = false

      // Get the log context
      const logContext = await this.loggerService.getLogContext(fetcher.sourceName, runPipelineDto, LogEvent.DATA_LOADING)
      let numberOfSavedTrials = await (this.loggerService.getNumberOfLogsByContextId(logContext.id)) * fetcher.studiesPerPage;
      const lastSucessfulLog = await this.loggerService.getLastSuccesfullLog(logContext)
      console.log("lastlog", lastSucessfulLog)
      if (lastSucessfulLog?.logEventType === LogEvent.DONE) {
        isDone = true;
      }
      let nextToken = lastSucessfulLog?.logInformation;

      console.log('nextToken', nextToken)
      if (!nextToken && logContext?.startingFrom > 0) {
        let numberOfpagesToSkip = Math.floor(logContext.startingFrom / fetcher.studiesPerPage)
        console.log('number of pages to skip', numberOfpagesToSkip);
        nextToken = await fetcher.determineStartPageToken(runPipelineDto, numberOfpagesToSkip);
      }

      let hasReachedLimit = (logContext?.numberOfTrials ? numberOfSavedTrials >= logContext?.numberOfTrials : false)

      console.log('hasReachedLimit', hasReachedLimit)
      console.log('isDone', isDone)
      console.log('this.isPipelineRunning(fetcher)', this.isPipelineRunning(fetcher))
      while (this.isPipelineRunning(fetcher) && !isDone) {
        // Fetch data from the source

        const currentPage = await retryWithBackoff(() =>
          fetcher.fetchPage(nextToken, runPipelineDto)
        );

        // Transform raw data into structured format
        const transformedData = transformer.transformClinicalTrialsData(currentPage);
        console.log('transformedData.length', transformedData.length)
        // Load transformed data into storage (e.g., Neo4j, database, etc.)
        await retryWithBackoff(() => loader.loadClinicalTrialData(transformedData));
        numberOfSavedTrials += fetcher.studiesPerPage;
        hasReachedLimit = (logContext?.numberOfTrials ? numberOfSavedTrials >= logContext?.numberOfTrials : false)

        // Log the progress
        const logEventType = currentPage.nextPageToken && !hasReachedLimit ? LogEvent.DATA_LOADING : LogEvent.DONE;
        const logInformation = currentPage.nextPageToken || LogEvent.NO_MORE_DATA_TO_LOAD;

        await retryWithBackoff(() =>
          this.loggerService.insertLastSuccesfullLog({
            logInformation,
            logEventType,
            logContextId: logContext.id,
          })
        );
        // Update loop variables

        isDone = (logEventType === LogEvent.DONE) || hasReachedLimit;
        nextToken = logInformation;
      }

      if (this.isPipelineStopped(fetcher)) {

        return "pipeline has been stopped by command from the admin"
      } else {
        this.stopPipeline(fetcher);
        // here change the state to "done" , now when he runs it again , then change it state to running
        console.log("pipeline execution compeleted")
        return "all the trial have been loaded"
      }

    } catch (error) {
      // here stop change the state to "failed" and log the error 
      this.collectionPipelines[fetcher.sourceName] = "failed"
      this.gateway.emitPipelinesStates({ collectionPipelines: this.collectionPipelines, refreshPipelines: this.refreshPipelines })


      console.error("Pipeline failed:", error);
      throw new BadRequestException("Pipeline execution halted due to errors.");
    }
  }

  // async runScheduler() {
  //   const start = Date.now();
  //   console.log("Starting Data Refresh Scheduler at:", formatTime(start));

  //   const params: RunEtlPipelineDto = {
  //     status: [ClinicalTrialStatusEnum.RECRUITING],
  //   };

  //   const DataSources: { fetcher: IClinicalTrialsFetcher, transformer: IClinicalTrialsTransformer }[] = [
  //     { fetcher: new ClinicalTrialsGovFetcher(), transformer: new ClinicalTrialsGovTransformer() },
  //     { fetcher: new UnicancerFetcher(), transformer: new UnicancerTransformer() },
  //     { fetcher: new CancerFrFetcher(), transformer: new CancerFrTransformer() }
  //   ];

  //   await Promise.all(DataSources.map(source => this.processSource(source.fetcher, source.transformer, params)));

  //   const end = Date.now();
  //   console.log("Data Refresh Scheduler completed at:", formatTime(end));

  //   const totalSeconds = ((end - start) / 1000).toFixed(2); // Converts milliseconds to seconds
  //   console.log(`Total time taken: ${totalSeconds} seconds`);
  // }

  private async processSource(
    fetcher: IClinicalTrialsFetcher,
    transformer: IClinicalTrialsTransformer,
    params?: RunEtlPipelineDto
  ) {
    try {

      // process source it has retrial 10 times , if it has a freaking error it shows to the admin 
      // and then you can give him the possiblity to refresh again. 
      // we can add the stop refreshing and the logContext can be used for the retrial brk. 
      // 

      console.log(`Starting Data refresh for fetcher: ${fetcher.sourceName}`);
      this.emitRefreshPipelines(fetcher.sourceName, "refreshing")
      const logContext = await this.loggerService.getLogContext(fetcher.sourceName, params, LogEvent.DATA_REFRESHING);
      const lastSucessfulLog = await this.loggerService.getLastSuccesfullLog(logContext);
      let nextToken = lastSucessfulLog?.logInformation;
      if (nextToken === LogEvent.DONE) {
        return "Data Refreshing is already done";
      }

      while (true) {

        const trialsBatch = await retryWithBackoff(() =>
          fetcher.fetchPage(nextToken, params)
        );

        const transformedBatch = transformer.transformClinicalTrialsData(trialsBatch);
        await Promise.all(transformedBatch.map(trial => this.processClinicalTrial(trial)));
        // Log progress
        const logEventType = trialsBatch.nextPageToken ? LogEvent.DATA_REFRESHING : LogEvent.DONE;
        nextToken = trialsBatch.nextPageToken || LogEvent.NO_MORE_DATA_TO_REFRESH;

        await retryWithBackoff(() =>
          this.loggerService.insertLastSuccesfullLog({
            logInformation: nextToken,
            logEventType,
            logContextId: logContext.id,
          })
        );

        if (nextToken === LogEvent.NO_MORE_DATA_TO_REFRESH) {
          const deletedContextLog = await this.loggerService.deleteRefreshLogContextsLogically(logContext.id);
          break
        }
      }
      this.emitRefreshPipelines(fetcher.sourceName, "refresh completed")
      console.log(`Finished processing fetcher: ${fetcher.sourceName}`);

    } catch (error) {
      console.log(`Error processing fetcher ${fetcher.sourceName}: ${error}`);
      this.emitRefreshPipelines(fetcher.sourceName, "refresh failed");
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

  public async refreshDataSource(slug: string) {
    const fetcher = this.getFetcherBySlug(slug);
    const transformer = this.getTransformerBySlug(slug);
    const params: RunEtlPipelineDto = {
      status: [ClinicalTrialStatusEnum.RECRUITING],
    };

    this.processSource(fetcher, transformer, params).then(() => {
      console.log(` data source refreshed successfully`);
    }
    ).catch((error) => {
      console.error("Error in refreshing the data source :", error);
    });;
  }

  private getFetcherBySlug(slug: string): IClinicalTrialsFetcher {
    switch (slug) {
      case 'clinical-trials-gov':
        return new ClinicalTrialsGovFetcher();
      case 'unicancer':
        return new UnicancerFetcher();
      case 'cancer-fr':
        return new CancerFrFetcher();
      default:
        throw new HttpException(`Unknown slug: ${slug}`, 400);
    }
  }

  private getTransformerBySlug(slug: string): IClinicalTrialsTransformer {
    switch (slug) {
      case 'clinical-trials-gov':
        return new ClinicalTrialsGovTransformer();
      case 'unicancer':
        return new UnicancerTransformer();
      case 'cancer-fr':
        return new CancerFrTransformer();
      default:
        throw new HttpException(`Unknown slug: ${slug}`, 400);
    }
  }

  private async processClinicalTrial(trial: ClinicalTrial) {
    try {
      const existingTrial = await this.clinicalTrialService.findOneByOriginalTrialId(trial?.sourceMetaData?.originalSourceId);
      // console.log('existingTrial', existingTrial)
      if (!existingTrial || trial.dates?.lastUpdatedOnSource > existingTrial.dates?.lastUpdated || !trial.dates) {
        await this.clinicalTrialService.updateOrCreate(trial);
      }
    } catch (error) {
      console.error(`Error processing trial ${trial?.sourceMetaData?.originalSourceId}: ${error.message}`);
    }
  }

  public async runPipelineBySlug(runPipelineDto: RunEtlPipelineDto, slug: string) {
    const fetcher = this.getFetcherBySlug(slug);
    const transformer = this.getTransformerBySlug(slug);
    const loader = new Neo4jLoader(this.neo4jService, this.embeddingService);

    this.runPipeline(runPipelineDto, fetcher, transformer, loader).then(() => {
      console.log(` pipeline for ${slug} started successfully`);
    }
    ).catch((error) => {
      console.error("Error in running the pipeline:", error);
    });

  }

  public async stopPipelineBySlug(slug: string) {
    const fetcher = this.getFetcherBySlug(slug);
    this.stopPipeline(fetcher);
    return "Stopping the pipeline request has been sent, the pipeline is stopping ,  wait for the pipeline to finish loading the current page , and reach a stable state";
  }

}
