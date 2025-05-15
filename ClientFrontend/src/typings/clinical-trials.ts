export type ClinicalTrialStatus =
  | "COMPLETED"
  | "NOT_YET_RECRUITING"
  | "UNKNOWN"
  | "ACTIVE_NOT_RECRUITING"
  | "WITHDRAWN"
  | "TERMINATED"
  | "RECRUITING"
  | "SUSPENDED"
  | "ENROLLING_BY_INVITATION"
  | "APPROVED_FOR_MARKETING"
  | "NO_LONGER_AVAILABLE"
  | "TEMPORARILY_NOT_AVAILABLE";

export type ClinicalTrialType =
  | "INTERVENTIONAL"
  | "OBSERVATIONAL"
  | "EXPANDED_ACCESS";

export type ClinicalTrialPhase =
  | "NA"
  | "PHASE1"
  | "PHASE2"
  | "PHASE3"
  | "PHASE4"
  | "EARLY_PHASE1";

export type ClinicalTrial = {
  id: string;
  title?: string;
  summary?: string;
  organization?: string;
  status?: ClinicalTrialStatus;
  originalSourceId?: string;
  currentEnrollmentCount?: number;
  type?: ClinicalTrialType;
  phase?: ClinicalTrialPhase;
  conditions?: {
    id?: string;
    name?: string;
  }[];
  interventions?: {
    id?: string;
    name?: string;
    description?: string;
    type?: string;
  }[];
  dates?: {
    id?: string;
    startDate?: string;
    estimatedCompletionDate?: string;
    lastUpdated?: string;
    firstFetched?: string;
  };
  eligibility?: {
    id?: string;
    maxAge?: number;
    minAge?: number;
    gender?: "ALL" | "MALE" | "FEMALE";
    eligibilityCriteria?: string;
  };
  locations?: {
    id?: string;
    facility?: string;
    longitude?: number;
    latitude?: number;
    country?: string;
    city?: string;
  }[];
  collaborators?: {
    id?: string;
    name?: string;
  }[];
  contacts?: {
    id?: string;
    phone?: string;
    isMainContact?: boolean;
    email?: string;
    name?: string;
  }[];
  sponsor?: {
    id?: string;
    name?: string;
  };
  sourceMetaData?: {
    dataSource?: {
      id?: string;
      name?: string;
      type?: string;
    };
    originalSourceId?: string;
    trialSourceUrl?: string;
  };
};
