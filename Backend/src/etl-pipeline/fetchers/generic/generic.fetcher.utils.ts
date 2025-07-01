export interface GenericFetcherConfig {
  baseUrl: string;
  searchPage: {
    pagination: { param: string };
    selectors: {
      trialCard: GenericType;
      trialLink: GenericType;
    };
  },
  trialPage: {
    selectors: {
      basicInfo: {
        title: GenericType;
        updateDateElement: GenericType;
        updateDate : GenericType;
        cancerTypes: GenericType;
        specialties: GenericType;
        sex: GenericType;
        ageGroup: GenericType;
        promoter: GenericType;
        status: GenericType;
      };
      progressInfo: {
        progressText: GenericType;
        openingDatePlanned: GenericType;
        openingDateEffective: GenericType;
        inclusionEndPlanned: GenericType;
        inclusionEndEffective: GenericType;
        lastInclusion: GenericType;
        plannedInclusions: {
          france: GenericType;
          allCountries: GenericType;
        };
        actualInclusions: {
          france: GenericType;
          allCountries: GenericType;
        };
        plannedCenters: {
          france: GenericType;
          allCountries: GenericType;
        };
      };
      summary: {
        summarySelector: GenericType;
        summaryElement: GenericType;
      };
    };
  };
}

interface GenericType {
    type: string;
    text: string;
}

export interface GenericTrialData {
  basicInfo: GenericTrialBasicInfo;
  id: string;
  progress: GenericTrialProgress;
  summary: string;
  populationInfo: Record<string, string>;
  references: Record<string, string>;
  trialCharacteristics: Record<string, string>;
  scientificDetails: GenericTrialScientificDetails;
  participatingCenters: GenericTrialCenter[];
}

export interface GenericTrialBasicInfo {
  title: string;
  updateDate: string;
  cancerTypes: string[];
  specialties: string[];
  sex: string;
  ageGroup: string;
  promoter: string;
  status: string;
}

export interface GenericTrialProgress {
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

export interface GenericTrialScientificDetails {
  officialTitle: string;
  professionalSummary: string;
  primaryObjectives: string;
  secondaryObjectives: string[];
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  evaluationCriteria: string;
}

export interface GenericTrialCenter {
  name: string;
  address: string;
  phone: string;
  website: string;
  coordinates: any;
}

