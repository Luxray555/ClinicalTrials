import { ClinicalTrial } from "../types/data-model";

export interface IClinicalTrialsLoader {
  loadClinicalTrialData(studies: ClinicalTrial[]): Promise<void>;
}