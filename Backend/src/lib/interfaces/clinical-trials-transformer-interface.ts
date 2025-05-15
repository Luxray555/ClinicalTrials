import { ClinicalTrial } from "../types/data-model";

export interface IClinicalTrialsTransformer {
  transformClinicalTrialsData(data: any): ClinicalTrial[];
}