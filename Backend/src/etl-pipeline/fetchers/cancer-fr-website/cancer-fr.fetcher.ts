import { chromium, ElementHandle } from 'playwright';
import { BaseResult, IClinicalTrialsFetcher } from '@/lib/interfaces/clinical-trials-fetcher-interface';
import { WebScraper } from '@/lib/interfaces/webscraper-class';
import { RunEtlPipelineDto } from '@/etl-pipeline/dto/run-etl-pipeline.dto';
import { DataSourceName } from '@/lib/types/data-model';
import * as cheerio from 'cheerio';
import { extractFromProgressText } from '@/lib/utils/common';
import { CancerFrTrialBasicInfo, CancerFrTrialCenter, CancerFrTrialData, CancerFrTrialProgress, CancerFrTrialScientificDetails } from './cancer-fr.fetcher.utils';
import { createHash } from 'crypto';


export class CancerFrFetcher extends WebScraper implements IClinicalTrialsFetcher {
    sourceName: DataSourceName = 'Cancer.fr Website';
    studiesPerPage: number = 30;
    private baseUrl = 'https://www.cancer.fr/personnes-malades/registre-des-essais-cliniques';

    private buildPageUrl(query?: RunEtlPipelineDto, pageNumber: number = 1): string {
        // If there's pagination logic, it would go here
        // For now, we're just returning the base URL
        return this.baseUrl + `?page=${pageNumber}`;
    }

    async safeGetText(element: any, selector: string): Promise<string> {
        try {
            const textElement = await element.$(selector);
            return textElement ? (await textElement.textContent()).trim() : '';
        } catch (error) {
            return '';
        }
    }

    async safeGetAttribute(element: any, selector: string, attribute: string): Promise<string> {
        try {
            const selectedElement = await element.$(selector);
            return selectedElement ? (await selectedElement.getAttribute(attribute)) : '';
        } catch (error) {
            return '';
        }
    }

    private async createId(url: string): Promise<string> {
        const hash = createHash('sha256').update(url + this.baseUrl).digest('base64url');
        return hash.slice(0, 20) // Return the first 12 characters
    }

    determineStartPageToken(runPipelineDto: RunEtlPipelineDto, numberOfpagesToSkip: number): Promise<any> {
        return Promise.resolve(numberOfpagesToSkip + 1);

    }

    async fetchPage(pageIdentificator?: any, query?: RunEtlPipelineDto): Promise<BaseResult & Record<string, any>> {
        const pageNumber = Number(pageIdentificator) || 1;
        const pageUrl = this.buildPageUrl(query, pageNumber);
        console.log('Fetching page:', pageUrl);

        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();

        try {

            await page.goto(pageUrl, { timeout: 160000 });
            await page.waitForLoadState('networkidle');

            // Using the selectors specific to cancer.fr
            const TRIAL_SELECTOR = '.card-inca-trial';
            const LINK_SELECTOR = 'h2.card-title a';

            // Get all trial elements
            const trialElements = await page.$$(TRIAL_SELECTOR);
            console.log(`Found ${trialElements.length} trials on page`);

            // Extract URLs for detailed pages
            const trialUrls = [];
            for (const element of trialElements) {
                const relativeUrl = await this.safeGetAttribute(element, LINK_SELECTOR, 'href');
                if (relativeUrl) {
                    const fullUrl = new URL(relativeUrl, this.baseUrl).href;
                    trialUrls.push(fullUrl);
                }
            }


            // Process URLs in parallel batches (10 at a time)
            const batchSize = 10;
            const detailedTrials = [];

            for (let i = 0; i < trialUrls.length; i += batchSize) {
                console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(trialUrls.length / batchSize)}`);

                // Get the batch of URLs to process
                const batch = trialUrls.slice(i, i + batchSize);

                // Create a context for each batch to manage parallel tabs

                // Process each URL in parallel
                const batchPromises = batch.map(async (url) => {
                    // const tab = await context.newPage();
                    const trialInfo = await this.fetchClinicalTrialInfo(url);
                    // await tab.close();
                    return trialInfo;
                });

                // Wait for all parallel tabs to complete
                const batchResults = await Promise.all(batchPromises);

                // Add valid results to the detailed trials list
                batchResults.forEach(result => {
                    if (result) {
                        detailedTrials.push(result);
                    }
                });
            }

            return {
                trials: detailedTrials,
                nextPageToken: pageNumber ? pageNumber + 1 : 2
            };

        } catch (error) {
            console.error(`Error fetching page ${pageUrl}: ${error}`);
            // await browser.close();
            return { trials: [], error: `Failed to fetch page: ${error}` };
        } finally {
            await browser.close();
        }
    }


    /**
 * Fetches and extracts comprehensive information from a clinical trial webpage
 * @param url The URL of the clinical trial page to scrape
 * @returns A structured object containing all available clinical trial data
 */
    async fetchClinicalTrialInfo(url: string): Promise<CancerFrTrialData | null> {
        try {
            const response = await fetch(url, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "accept-language": "en-US,en;q=0.9,fr;q=0.8",
                    "upgrade-insecure-requests": "1",
                    "Referer": "https://www.cancer.fr/personnes-malades/registre-des-essais-cliniques",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "method": "GET"
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // Create the data structure with all possible fields
            const trialData: CancerFrTrialData = {
                id: await this.createId(url),
                basicInfo: this.extractBasicInfo($),
                progress: this.extractProgressInfo($),
                summary: this.extractSummary($),
                populationInfo: this.extractPopulationInfo($),
                references: this.extractReferences($),
                trialCharacteristics: this.extractTrialCharacteristics($),
                scientificDetails: this.extractScientificDetails($),
                participatingCenters: this.extractCentersInfo($)
            };

            return trialData;
        } catch (error) {
            console.error(`Error fetching or parsing clinical trial data: ${error}`);
            return null;
        }
    }

    /**
     * Extracts basic information about the clinical trial
     */
    private extractBasicInfo($: cheerio.CheerioAPI): CancerFrTrialBasicInfo {
        const title = $('h1.like-h2').text().trim();
        const updateDateElement = $('.article-section-date time');
        const updateDate = updateDateElement.attr('datetime') || '';

        // Extract cancer types
        const cancerTypes: string[] = [];
        this.extractListItems($, 'div.clinical-data-item p strong:contains("Type(s) de cancer")', cancerTypes);

        // Extract specialties
        const specialties: string[] = [];
        this.extractListItems($, 'div.clinical-data-item p strong:contains("Spécialité")', specialties);

        // Extract sex and age information
        const sex = this.extractFieldText($, 'div.clinical-data-item p strong:contains("Sexe")');
        const ageGroup = this.extractFieldText($, 'div.clinical-data-item p strong:contains("Catégorie âge")');

        // Extract promoter and status
        const promoter = this.extractFieldText($, 'div.clinical-data-item p strong:contains("Promoteur")');
        const status = this.extractFieldText($, 'div.clinical-data-item p strong:contains("Etat de l\'essai")');

        return {
            title: this.cleanText(title),
            updateDate,
            cancerTypes,
            specialties,
            sex: this.cleanText(sex),
            ageGroup: this.cleanText(ageGroup),
            promoter: this.cleanText(promoter),
            status: this.cleanText(status)
        };
    }

    /**
     * Extracts progress information about the clinical trial
     */
    private extractProgressInfo($: cheerio.CheerioAPI): CancerFrTrialProgress {
        const progressText = this.extractFieldText($, 'div.clinical-data-item p strong:contains("Avancement de l\'essai")');

        return {
            openingDatePlanned: this.extractValueFromText(progressText, /Ouverture prévue le\s*:\s*([^,\r\n]+)/),
            openingDateEffective: this.extractValueFromText(progressText, /Ouverture effective le\s*:\s*([^,\r\n]+)/),
            inclusionEndPlanned: this.extractValueFromText(progressText, /Fin d'inclusion prévue le\s*:\s*([^,\r\n]+)/),
            inclusionEndEffective: this.extractValueFromText(progressText, /Fin d'inclusion effective le\s*:\s*([^,\r\n]+)/),
            lastInclusion: this.extractValueFromText(progressText, /Dernière inclusion le\s*:\s*([^,\r\n]+)/),
            plannedInclusions: {
                france: this.extractValueFromText(progressText, /Nombre d['']inclusions prévues:[\s\S]*?France:\s*([^,\r\n]+)/),
                allCountries: this.extractValueFromText(progressText, /Nombre d['']inclusions prévues:[\s\S]*?Tous pays:\s*([^,\r\n]+)/)
            },
            actualInclusions: {
                france: this.extractValueFromText(progressText, /Nombre d['']inclusions faites :[\s\S]*?France:\s*([^,\r\n]+)/),
                allCountries: this.extractValueFromText(progressText, /Nombre d['']inclusions faites :[\s\S]*?Tous pays:\s*([^,\r\n]+)/)
            },
            plannedCenters: {
                france: this.extractValueFromText(progressText, /Nombre de centres? prévus :[\s\S]*?France:\s*([^,\r\n]+)/),
                allCountries: this.extractValueFromText(progressText, /Nombre de centres? prévus :[\s\S]*?Tous pays:\s*([^,\r\n]+)/)
            }
        };
    }

    /**
     * Extracts the summary of the clinical trial
     */
    private extractSummary($: cheerio.CheerioAPI): string {
        const summarySelector = 'h2.lined-title span.text:contains("Résumé")';
        const summaryElement = $(summarySelector).closest('h2').next('p');
        return this.cleanText(summaryElement.text());
    }

    /**
     * Extracts population information about the clinical trial
     */
    private extractPopulationInfo($: cheerio.CheerioAPI): Record<string, string> {
        const populationInfo: Record<string, string> = {};
        const populationSelector = 'h2.lined-title span.text:contains("Population cible")';

        $(populationSelector).closest('h2').next('ul').find('li').each((_, el) => {
            const text = $(el).text().trim();
            const separatorIndex = text.indexOf(':');

            if (separatorIndex !== -1) {
                const key = text.substring(0, separatorIndex).trim();
                const value = text.substring(separatorIndex + 1).trim();
                populationInfo[key] = this.cleanText(value);
            }
        });

        return populationInfo;
    }

    /**
     * Extracts references for the clinical trial
     */
    private extractReferences($: cheerio.CheerioAPI): Record<string, string> {
        const references: Record<string, string> = {};
        const referencesSelector = 'h2.lined-title span.text:contains("Références de l\'essai")';

        $(referencesSelector).closest('h2').next('ul').find('li').each((_, el) => {
            const text = $(el).text().trim();
            const separatorIndex = text.indexOf(':');

            if (separatorIndex !== -1) {
                const key = text.substring(0, separatorIndex).trim();
                const value = text.substring(separatorIndex + 1).trim();
                references[key] = this.cleanText(value);
            }
        });

        return references;
    }

    /**
     * Extracts trial characteristics
     */
    private extractTrialCharacteristics($: cheerio.CheerioAPI): Record<string, string> {
        const characteristics: Record<string, string> = {};
        const characteristicsSelector = 'h2.lined-title span.text:contains("Caractéristiques de l\'essai")';

        $(characteristicsSelector).closest('h2').next('ul').find('li').each((_, el) => {
            const text = $(el).text().trim();
            const separatorIndex = text.indexOf(':');

            if (separatorIndex !== -1) {
                const key = text.substring(0, separatorIndex).trim();
                const value = text.substring(separatorIndex + 1).trim();
                characteristics[key] = this.cleanText(value);
            }
        });

        return characteristics;
    }

    /**
     * Extracts detailed scientific information
     */
    private extractScientificDetails($: cheerio.CheerioAPI): CancerFrTrialScientificDetails {
        // Extract official title
        const officialTitleSelector = 'p.my-2 strong:contains("Titre officiel")';
        const officialTitle = $(officialTitleSelector).parent().text().replace('Titre officiel de l\'essai :', '').trim();

        // Extract professional summary
        const professionalSummarySelector = 'p.my-2 strong:contains("Résumé à destination des professionnels")';
        const professionalSummary = $(professionalSummarySelector).parent().text().replace('Résumé à destination des professionnels :', '').trim();

        // Extract primary objectives
        const primaryObjectivesSelector = 'p.my-2 strong:contains("Objectif(s) principal")';
        const primaryObjectives = $(primaryObjectivesSelector).parent().text().replace(/Objectif\(s\) principal\(aux\) :/, '').trim();

        // Extract secondary objectives
        const secondaryObjectives: string[] = [];
        $('p.m-0 strong:contains("Objectifs secondaires")').parent().next('ul').find('li').each((_, el) => {
            secondaryObjectives.push(this.cleanText($(el).text()));
        });

        // Extract inclusion criteria
        const inclusionCriteria: string[] = [];
        $('p.m-0 strong:contains("Critères d\'inclusion")').parent().next('ul').find('li').each((_, el) => {
            inclusionCriteria.push(this.cleanText($(el).text()));
        });

        // Extract exclusion criteria
        const exclusionCriteria: string[] = [];
        $('p.m-0 strong:contains("Critères de non inclusion")').parent().next('ul').find('li').each((_, el) => {
            exclusionCriteria.push(this.cleanText($(el).text()));
        });

        // Extract evaluation criteria
        const evaluationCriteriaSelector = 'p.my-2 strong:contains("Critère(s) d\'évaluation")';
        const evaluationCriteria = $(evaluationCriteriaSelector).parent().text().replace(/Critère\(s\) d['']évaluation principal\(aux\) :/, '').trim();

        return {
            officialTitle: this.cleanText(officialTitle),
            professionalSummary: this.cleanText(professionalSummary),
            primaryObjectives: this.cleanText(primaryObjectives),
            secondaryObjectives,
            inclusionCriteria,
            exclusionCriteria,
            evaluationCriteria: this.cleanText(evaluationCriteria)
        };
    }

    /**
     * Extracts information about participating centers
     */
    private extractCentersInfo($: cheerio.CheerioAPI): CancerFrTrialCenter[] {
        const centers: CancerFrTrialCenter[] = [];

        $('.list-articles-item').each((_, el) => {
            const name = $(el).find('h3.card-title').text().trim();
            const addressElement = $(el).find('.incaicon-location_pin').parent().find('.text');
            const phoneElement = $(el).find('.incaicon-stay_current_portrait').parent().find('.text.phone');
            const websiteElement = $(el).find('.material-symbols-outlined:contains("link")').parent().find('.text.site');

            const card = $(el).find('.card');
            const latitude = card.data('latitude') || null;
            const longitude = card.data('longitude') || null;

            centers.push({
                name: this.cleanText(name),
                address: this.cleanText(addressElement.text()),
                phone: phoneElement.length ? this.cleanText(phoneElement.text()) : '',
                website: websiteElement.length ? this.cleanText(websiteElement.text()) : '',
                coordinates: latitude && longitude ? { latitude, longitude } : null
            });
        });

        return centers;
    }

    /**
     * Helper method to extract list items from an element with the given selector
     */
    private extractListItems($: cheerio.CheerioAPI, selector: string, result: string[]): void {
        $(selector).parent().siblings('ul').find('li').each((_, el) => {
            result.push(this.cleanText($(el).text()));
        });
    }

    /**
     * Helper method to extract text from field identified by selector
     */
    private extractFieldText($: cheerio.CheerioAPI, selector: string): string {
        return $(selector).parent().siblings('p').text().trim();
    }

    /**
     * Helper method to extract a value from text using regex
     */
    private extractValueFromText(text: string, regex: RegExp): string {
        const match = text.match(regex);
        return match && match[1] ? this.cleanText(match[1]) : '';
    }

    /**
     * Cleans text by removing HTML tags, normalizing whitespace, etc.
     */
    private cleanText(text: string): string {
        return text
            .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')        // Replace &nbsp; with space
            .replace(/\s+/g, ' ')           // Normalize whitespace
            .trim();                         // Trim leading/trailing whitespace
    }




} // end of class 


