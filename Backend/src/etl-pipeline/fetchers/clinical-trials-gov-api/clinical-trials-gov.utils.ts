
//* Types & interfaces

import { logRecord } from "@/logger/entities/log-record-entity";

export type ClinicalTrialSearchParams = {
    query?: {
        cond?: string;    // Conditions or disease
        term?: string;    // Other terms
        locn?: string;    // Location terms
        titles?: string;  // Title / acronym
        intr?: string;    // Intervention / treatment
        outc?: string;    // Outcome measure
        spons?: string;   // Sponsor / collaborator
        lead?: string;    // LeadSponsorName field
        id?: string;      // Study IDs
        patient?: string; // Patient search
    };
    filter?: {
        overallStatus?: string[];  // Array of status values
        geo?: string;             // Geo-function filter
        ids?: string[];           // NCT IDs filter
        advanced?: string;        // Advanced Essie expression
        synonyms?: string[];      // Area:synonym_id pairs
    };
    postFilter?: {
        overallStatus?: string[];
        geo?: string;
        ids?: string[];
        advanced?: string;
        synonyms?: string[];
    };
    aggFilters?: string;        // Aggregation filters
    geoDecay?: string;         // Proximity factor settings
    fields?: string[];         // Fields to return
    sort?: string[];          // Sorting options (max 2 items)
    countTotal?: boolean;     // Whether to return total count
    pageSize?: number;        // Max number of studies per page
    pageToken?: string;       // Token for pagination
}

export type ClinicalTrialGovStudy = {
    protocolSection?: {
        identificationModule?: Record<string, any>;
        statusModule?: Record<string, any>;
        sponsorCollaboratorsModule?: Record<string, any>;
        oversightModule?: Record<string, any>;
        descriptionModule?: Record<string, any>;
        conditionsModule?: Record<string, any>;
        designModule?: Record<string, any>;
        armsInterventionsModule?: Record<string, any>;
        outcomesModule?: Record<string, any>;
        eligibilityModule?: Record<string, any>;
        contactsLocationsModule?: Record<string, any>;
        referencesModule?: Record<string, any>;
        ipdSharingStatementModule?: Record<string, any>;
    };
    resultsSection?: Record<string, any>;
    annotationSection?: Record<string, any>;
    documentSection?: Record<string, any>;
    derivedSection?: Record<string, any>;
    hasResults?: boolean;
};

export type ClinicalTrialGovApiResponse = {
    nextPageToken?: string;
    studies?: ClinicalTrialGovStudy[];
    totalCount?: number;
};

//* Utils functions



export function flattenSearchParamsObject(params: ClinicalTrialSearchParams): string {

    const flattenedParams: Record<string, string> = {};

    function flattenHelper(obj: any, prefix: string = ''): void {
        Object.keys(obj).forEach((key) => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            // Skip keys with null or undefined values
            if (value === null || value === undefined) {
                return;
            }

            if (Array.isArray(value)) {
                flattenedParams[newKey] = value.join('|'); // Join array elements with |
            } else if (typeof value === 'object' && value !== null) {
                flattenHelper(value, newKey); // Recursively flatten nested objects
            } else {
                // Do not encode the filter.advanced value
                if (newKey === 'filter.advanced' && value !== undefined) {
                    flattenedParams[newKey] = String(value);
                } else {
                    flattenedParams[newKey] = encodeURIComponent(String(value));
                }
            }
        });
    }

    flattenHelper(params);

    // Build the query string
    const queryString = Object.entries(flattenedParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${value}`)
        .join('&');

    return queryString;
}