import { Integer } from 'neo4j-driver';

// Enumerations using const assertion
export const ClinicalTrialStatusEnum = {
  COMPLETED: 'COMPLETED',
  NOT_YET_RECRUITING: 'NOT_YET_RECRUITING',
  UNKNOWN: 'UNKNOWN',
  ACTIVE_NOT_RECRUITING: 'ACTIVE_NOT_RECRUITING',
  WITHDRAWN: 'WITHDRAWN',
  TERMINATED: 'TERMINATED',
  RECRUITING: 'RECRUITING',
  SUSPENDED: 'SUSPENDED',
  ENROLLING_BY_INVITATION: 'ENROLLING_BY_INVITATION',
  APPROVED_FOR_MARKETING: 'APPROVED_FOR_MARKETING',
  NO_LONGER_AVAILABLE: 'NO_LONGER_AVAILABLE',
  TEMPORARILY_NOT_AVAILABLE: 'TEMPORARILY_NOT_AVAILABLE',
} as const;

export type ClinicalTrialStatus =
  (typeof ClinicalTrialStatusEnum)[keyof typeof ClinicalTrialStatusEnum];

export const ClinicalTrialTypeEnum = {
  INTERVENTIONAL: 'INTERVENTIONAL',
  OBSERVATIONAL: 'OBSERVATIONAL',
  EXPANDED_ACCESS: 'EXPANDED_ACCESS',
} as const;

export type ClinicalTrialType =
  (typeof ClinicalTrialTypeEnum)[keyof typeof ClinicalTrialTypeEnum];

export const ClinicalTrialPhaseEnum = {
  NA: 'NA',
  PHASE1: 'PHASE1',
  PHASE2: 'PHASE2',
  PHASE3: 'PHASE3',
  PHASE4: 'PHASE4',
  EARLY_PHASE1: 'EARLY_PHASE1',
} as const;

export type ClinicalTrialPhase =
  (typeof ClinicalTrialPhaseEnum)[keyof typeof ClinicalTrialPhaseEnum];

export const InterventionTypeEnum = {
  DEVICE: 'DEVICE',
  DRUG: 'DRUG',
  OTHER: 'OTHER',
  DIAGNOSTIC_TEST: 'DIAGNOSTIC_TEST',
  BIOLOGICAL: 'BIOLOGICAL',
  PROCEDURE: 'PROCEDURE',
  BEHAVIORAL: 'BEHAVIORAL',
  DIETARY_SUPPLEMENT: 'DIETARY_SUPPLEMENT',
  COMBINATION_PRODUCT: 'COMBINATION_PRODUCT',
  RADIATION: 'RADIATION',
  GENETIC: 'GENETIC',
} as const;

export type InterventionType =
  (typeof InterventionTypeEnum)[keyof typeof InterventionTypeEnum];

export const DataTypeEnum = {
  JSON: 'JSON',
  CSV: 'CSV',
  XML: 'XML',
} as const;

export type DataType = (typeof DataTypeEnum)[keyof typeof DataTypeEnum];

export const SourceTypeEnum = {
  API: 'API',
  DATABASE: 'DATABASE',
  WEBSCRAPER: 'WEBSCRAPER',
} as const;

export type SourceType = (typeof SourceTypeEnum)[keyof typeof SourceTypeEnum];

export const GenderEnum = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  ALL: 'ALL',
} as const;


export const OrderByEnum = {
  LAST_CREATED: 'LAST_CREATED',
  FIRST_CREATED: 'FIRST_CREATED',
} as const;

export type OrderBy = (typeof OrderByEnum)[keyof typeof OrderByEnum];

export type Gender = (typeof GenderEnum)[keyof typeof GenderEnum];

export const PatientHealthStatusEnum = {
  STABLE: 'STABLE',
  IMPROVING: 'IMPROVING',
  DETERIORATING: 'DETERIORATING',
  CRITICAL: 'CRITICAL',
  RECOVERED: 'RECOVERED',
  UNDER_TREATMENT: 'UNDER_TREATMENT',
  UNKNOWN: 'UNKNOWN',
} as const;

export type PatientHealthStatus =
  (typeof PatientHealthStatusEnum)[keyof typeof PatientHealthStatusEnum];


export type Schedule = {
  id?: string;
  frequency?: "WEEKLY" | "DAILY" | "MONTHLY" | "MANUAL"; // e.g., "weekly", "monthly"
  timeOfDay?: string;
  dayOfWeek?: number; // 0-6 (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  dayOfMonth?: number; // 1-31
};

export type DataSource = {
  id?: string;
  name: DataSourceName;
  type?: SourceType;
  uri?: string;
  schedule?: Schedule;
};

export type SourceMetaData = {
  // sourceName?: string;
  originalSourceId?: string;
  trialSourceUrl?: string;
  dataSource: DataSource;
};

// Types
export type ClinicalTrial = {
  id?: string;
  title?: string;
  status?: ClinicalTrialStatus;
  summary?: string;
  currentEnrollmentCount?: Integer;
  type?: ClinicalTrialType;
  phase?: ClinicalTrialPhase;
  sponsor?: Sponsor;
  collaborators?: Collaborator[];
  interventions?: Intervention[];
  dates?: ClinicalTrialDates;
  eligibility?: Eligibility;
  conditions?: Condition[];
  locations?: Location[];
  organization?: string;
  // originalSourceId?: string;
  contacts?: Contact[];
  sourceMetaData?: SourceMetaData;
};

export type Sponsor = {
  id?: string;
  name?: string;
};

export type Collaborator = {
  id?: string;
  name?: string;
};

export type Intervention = {
  id?: string;
  name?: string;
  type?: InterventionType;
  description?: string;
};

export type ClinicalTrialDates = {
  id?: string;
  lastFetched?: string; // ISO 8601 format
  firstFetched?: string; // ISO 8601 format
  lastUpdatedOnSource?: string; // ISO 8601 format
  lastUpdated?: string; // ISO 8601 format
  startDate?: string; // ISO 8601 format
  estimatedCompletionDate?: string; // ISO 8601 format
};

export const DataSourceNames = {
  CLINICAL_TRIALS_GOV: 'ClinicalTrials.gov public API',
  ECLAIRE: 'ECLAIRE',
  UNICANCER: 'Unicancer.fr Website',
  INVESTIGATOR: 'From Investigator',
  CANCER_FR: 'Cancer.fr Website',
} as const;

export type DataSourceName =
  (typeof DataSourceNames)[keyof typeof DataSourceNames];

export type Eligibility = {
  id?: string;
  eligibilityCriteria?: string;
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
};

export type Condition = {
  id?: string;
  name?: string;
};

export type Contact = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  isMainContact?: boolean;
};

export type Patient = {
  id?: string;
  sqlId?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // ISO 8601 date format
  gender?: Gender;
  phone?: string;
  postalCode?: string;
  image?: string;
  healthStatus?: PatientHealthStatus;
  medicalHistory?: string;
  conditions?: Condition[];
  location?: Location;
};

export type Location = {
  id?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  facility?: string;
};
