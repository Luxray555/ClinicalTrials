export interface CancerFrTrialData {
    basicInfo: CancerFrTrialBasicInfo;
    id: string;
    progress: CancerFrTrialProgress;
    summary: string;
    populationInfo: Record<string, string>;
    references: Record<string, string>;
    trialCharacteristics: Record<string, string>;
    scientificDetails: CancerFrTrialScientificDetails;
    participatingCenters: CancerFrTrialCenter[];
}

export interface CancerFrTrialBasicInfo {
    title: string;
    updateDate: string;
    cancerTypes: string[];
    specialties: string[];
    sex: string;
    ageGroup: string;
    promoter: string;
    status: string;
}

export interface CancerFrTrialProgress {
    openingDatePlanned: string;
    openingDateEffective: string;
    inclusionEndPlanned: string;
    inclusionEndEffective: string;
    lastInclusion: string;
    plannedInclusions: {
        france: string;
        allCountries: string;
    };
    actualInclusions: {
        france: string;
        allCountries: string;
    };
    plannedCenters: {
        france: string;
        allCountries: string;
    };
}

export interface CancerFrTrialScientificDetails {
    officialTitle: string;
    professionalSummary: string;
    primaryObjectives: string;
    secondaryObjectives: string[];
    inclusionCriteria: string[];
    exclusionCriteria: string[];
    evaluationCriteria: string;
}

export interface CancerFrTrialCenter {
    name: string;
    address: string;
    phone: string;
    website: string;
    coordinates: any
}