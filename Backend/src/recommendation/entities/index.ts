import { ClinicalTrial } from "@/lib/types/data-model";

export interface SimilarTrialsInput {
    sourceTrialId: string;
    count: number;
    filters?: Record<string, any>;
}

export interface AiSearchInput {
    description: string;
    count: number;
    filters?: Record<string, any>;
}

export class Recommendation {
    recommendation: ClinicalTrial;
    score: number;
}

export type RecommendationResult = Recommendation[]
