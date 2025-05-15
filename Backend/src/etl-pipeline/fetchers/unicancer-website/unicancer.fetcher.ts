import { RunEtlPipelineDto } from "@/etl-pipeline/dto/run-etl-pipeline.dto";
import { UnicancerTrial } from "@/etl-pipeline/transformers/unicaner.transformer";
import { BaseResult, IClinicalTrialsFetcher } from "@/lib/interfaces/clinical-trials-fetcher-interface";
import { WebScraper } from "@/lib/interfaces/webscraper-class";
import { DataSourceName } from "@/lib/types/data-model";
import { createHash } from "crypto";
import { chromium } from 'playwright';



export class UnicancerFetcher extends WebScraper implements IClinicalTrialsFetcher {
    sourceName: DataSourceName = 'Unicancer.fr Website';
    studiesPerPage: number = 9;
    readonly apiUrl = 'https://www.unicancer.fr/fr/espace-recherche/la-recherche-clinique/les-essais-cliniques-unicancer/';



    determineStartPageToken(runPipelineDto: RunEtlPipelineDto, numberOfpagesToSkip: number): Promise<any> {
        return Promise.resolve(numberOfpagesToSkip + 1);
    }

    private buildPageUrl(runPipelineDto: RunEtlPipelineDto, pageNumber: number): string {
        console.log('runPipelineDto', runPipelineDto);

        let queryParams: string[] = [];

        if (runPipelineDto?.status) {
            if (runPipelineDto.status.includes('RECRUITING')) {
                queryParams.push('filter_status=En%20cours%20de%20recrutement');
            } else if (runPipelineDto.status.includes('COMPLETED')) {
                queryParams.push('filter_status=Recrutement%20termin%C3%A9');
            }
        }

        // Start with the base URL
        let url = this.apiUrl;

        // Append query params if any
        if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
        }

        // Ensure correct pagination handling
        url += (queryParams.length > 0 ? '&' : '?') + `pagin=${pageNumber}`;

        return url;
    }

    async fetchPage(pageIdentificator?: any, query?: RunEtlPipelineDto): Promise<BaseResult & Record<string, any>> {
        const pageNumber = Number(pageIdentificator) || 1;
        const pageUrl = this.buildPageUrl(query, pageNumber);
        console.log('pageUrl', pageUrl);

        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto(pageUrl, { timeout: 60000 });

        const CT_SELECTOR = 'article.block.block-program';
        const TITLE_SELECTOR = 'h2.block-title';
        const STATUS_SELECTOR = '.block-status p:first-child';  // Recruitment status
        const EXPERT_GROUP_SELECTOR = '.block-status p:nth-child(2)'; // Expert group
        const TAGS_SELECTOR = '.block-tag .tag ul li em'; // Tags like "Sein"
        const SUMMARY_SELECTOR = '.block-summary'; // Trial summary
        const INVESTIGATOR_SELECTOR = '.block-info p:nth-of-type(1) strong'; // Principal investigator
        const STUDY_PHASE_SELECTOR = '.block-info p:nth-of-type(2)'; // Study phase
        const SPONSOR_SELECTOR = '.block-info p:nth-of-type(3) strong'; // Sponsor
        const CONTACT_SELECTOR = '.block-info p:nth-of-type(4) a'; // Contact person
        const MORE_INFO_LINK_SELECTOR = '.block-button.ta-right a'; // "En savoir plus" link
        await page.waitForLoadState('networkidle'); // Waits until all network calls are finished

        const articles = await page.$$(CT_SELECTOR);

        const trials = await Promise.all(articles.map(async (article) => {
            try {
                const [
                    title,
                    status,
                    expertGroup,
                    tags,
                    summary,
                    investigator,
                    studyPhase,
                    sponsor,
                    contact,
                    moreInfoLink
                ] = await Promise.all([
                    this.safeGetText(article, TITLE_SELECTOR),
                    this.safeGetText(article, STATUS_SELECTOR),
                    this.safeGetText(article, EXPERT_GROUP_SELECTOR),
                    this.safeGetArrayText(article, TAGS_SELECTOR),
                    this.safeGetText(article, SUMMARY_SELECTOR),
                    this.safeGetText(article, INVESTIGATOR_SELECTOR),
                    this.safeGetText(article, STUDY_PHASE_SELECTOR),
                    this.safeGetText(article, SPONSOR_SELECTOR),
                    this.safeGetText(article, CONTACT_SELECTOR),
                    this.safeGetAttribute(article, MORE_INFO_LINK_SELECTOR, "href")
                ]);

                return {
                    id: await this.createId(summary),
                    title,
                    status,
                    expertGroup,
                    tags,
                    summary,
                    investigator,
                    studyPhase,
                    sponsor,
                    contact,
                    moreInfoLink: moreInfoLink ? moreInfoLink : pageUrl,
                };
            } catch (error) {
                console.warn(`Error extracting data from an article: ${error}`);
                return null;
            }
        }));

        await browser.close();
        return { trials: (trials.filter(Boolean) as UnicancerTrial[]), nextPageToken: trials.length > 0 ? pageNumber + 1 : undefined };

    }

    private async createId(summary: string): Promise<string> {
        const hash = createHash('sha256').update(summary + this.apiUrl).digest('base64url');
        return hash.slice(0, 20) // Return the first 12 characters
    }

}

