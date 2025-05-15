//? Fetches the clinical trials data from the "clinicalTrials.gov" API and returns the data to the caller
import { ClinicalTrialGovApiResponse, ClinicalTrialSearchParams, flattenSearchParamsObject } from './clinical-trials-gov.utils';
import { DataSourceName, DataSourceNames } from 'src/lib/types/data-model';
import { RunEtlPipelineDto } from '@/etl-pipeline/dto/run-etl-pipeline.dto';
import { BaseResult, IClinicalTrialsFetcher } from '@/lib/interfaces/clinical-trials-fetcher-interface';
import { HttpException } from '@nestjs/common';


export class ClinicalTrialsGovFetcher implements IClinicalTrialsFetcher {

    readonly apiUrl = 'https://clinicaltrials.gov/api/v2/studies';
    readonly sourceName: DataSourceName = DataSourceNames.CLINICAL_TRIALS_GOV;
    readonly studiesPerPage = 100;


    private async fetch(params: ClinicalTrialSearchParams = { pageSize: this.studiesPerPage, countTotal: true }): Promise<ClinicalTrialGovApiResponse> {
        try {
            // console.log('params', params)
            let url = this.apiUrl;
            if (params) {
                // console.log('flattenSearchParamsObject(params)', flattenSearchParamsObject(params))
                url = `${url}?${flattenSearchParamsObject(params)}`;
            }
            console.log('url', url);
            // const response = await retryWithBackoff(() => fetch(url));
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching data from clinicalTrial.gov api :', error);
            throw new HttpException(
                {
                    status: 500,
                    error: "Internal Server Error",
                    message: "Max retries reached",
                },
                500,
            );
            // throw error;
        }
    }


    async getNextPageToken(currentPageToken: string = null, runPipelineDto: RunEtlPipelineDto): Promise<string> {
        try {

            const query = this.buildClinicalTrialsQuery(runPipelineDto);

            const jsonResult = await this.fetch({
                pageToken: currentPageToken,
                filter: {
                    advanced: query,
                    overallStatus: runPipelineDto?.status
                },
                pageSize: this.studiesPerPage
            })
            return jsonResult.nextPageToken;
        }
        catch (error) {
            console.error('Error fetching data:', error);
            throw new HttpException(
                {
                    status: 500,
                    error: "Internal Server Error",
                    message: "Max retries reached",
                },
                500,
            );
            // throw error;

        }
    }

    async determineStartPageToken(runPipelineDto: RunEtlPipelineDto, numberOfpagesToSkip: number): Promise<string> {
        try {
            let nextPageToken = null;
            for (let i = 0; i < numberOfpagesToSkip; i++) {
                nextPageToken = await this.getNextPageToken(nextPageToken, runPipelineDto)
            }
            return nextPageToken;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }


    public async fetchClinicalTrialsByParams(params: ClinicalTrialSearchParams | undefined = undefined) {
        try {
            const jsonResult = await this.fetch(params);
            return jsonResult;
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    public async fetchClinicalTrialById(id: string) {
        try {

            const jsonResult = await this.fetch({ query: { id: id } });
            return jsonResult;

        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    public async fetchAllClinicalTrials(limit: number = undefined): Promise<ClinicalTrialGovApiResponse> {
        try {
            let finalJsonResult: ClinicalTrialGovApiResponse = {}

            const initialResult = await this.fetch();
            // to extract the first page token;
            finalJsonResult = initialResult;
            while (finalJsonResult.nextPageToken) {

                const nextPageResult = await this.fetch({ pageToken: finalJsonResult.nextPageToken });

                finalJsonResult = {
                    ...finalJsonResult,
                    studies: [...(finalJsonResult.studies || []), ...(nextPageResult.studies || [])],
                    nextPageToken: nextPageResult.nextPageToken,
                };

                if (limit && finalJsonResult.studies.length >= limit) {
                    finalJsonResult.studies = finalJsonResult.studies.slice(0, limit);
                    break;
                }
            }

            return finalJsonResult;
        }
        catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            //todo : store the lastPageToken in the database
        }
    };


    public buildClinicalTrialsQuery(dto: RunEtlPipelineDto): string {
        const filters: string[] = [];

        if (dto.country) {
            filters.push(`AREA[LocationCountry]${dto.country}`);
        }

        if (dto.startYear && dto.endYear) {
            filters.push(`AREA[StartDate]RANGE[${dto.startYear}-01-01,${dto.endYear}-12-31]`);
        }

        if (dto.conditions) {
            // Split conditions into an array and join with OR
            const conditions = dto.conditions.map(cond => cond.trim());
            filters.push(`AREA[Condition](${conditions.join(' OR ')})`);
        }

        if (filters.length > 0) {
            return filters.join(' AND ');
        }
        return undefined

    }



    fetchPage(pageIdentificator?: any, dto?: RunEtlPipelineDto): Promise<BaseResult & Record<string, any>> {
        const query = this.buildClinicalTrialsQuery(dto);
        return this.fetch({
            pageToken: pageIdentificator,
            filter: {
                advanced: query,
                overallStatus: dto?.status
            },
            pageSize: this.studiesPerPage
        })
    }

}

// todo : lazem the one who fetches the data to just refactor it to include the nextPageToken 

