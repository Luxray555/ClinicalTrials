import { IClinicalTrialsTransformer } from "@/lib/interfaces/clinical-trials-transformer-interface";
import { ClinicalTrial, ClinicalTrialPhase, ClinicalTrialPhaseEnum, ClinicalTrialStatus, ClinicalTrialStatusEnum, DataSourceNames } from "@/lib/types/data-model";

export class UnicancerTransformer implements IClinicalTrialsTransformer {
    transformClinicalTrialsData(data: any): ClinicalTrial[] {
        const trials: UnicancerTrial[] = data?.trials;
        return trials.map((trial: UnicancerTrial) => {
            return {
                title: trial.title,
                status: this.normalizeStatus(trial.status),
                conditions: trial?.tags.map(tag => { return { name: tag } }),
                summary: trial.summary,
                phase: this.normalizePhase(trial.studyPhase),
                sponsor: {
                    name: trial.sponsor || 'N/A'
                },
                contacts: [
                    {
                        name: trial.contact || 'N/A'
                    }
                ],
                sourceMetaData: {
                    originalSourceId: trial.id,
                    trialSourceUrl: trial.moreInfoLink,
                    dataSource: {
                        name: DataSourceNames.UNICANCER
                    }
                },
                collaborators: [
                    {
                        name: trial.expertGroup || 'N/A'
                    },
                    {
                        name: trial.investigator || 'N/A'
                    }
                ],
                locations: [{
                    country: 'France'
                }]

            } as ClinicalTrial

        });

    }

    normalizeStatus(status: string): ClinicalTrialStatus {
        if (status === 'En cours de recrutement') {
            return ClinicalTrialStatusEnum.RECRUITING;
        }
        if (status === 'Recrutement terminé') {
            return ClinicalTrialStatusEnum.COMPLETED;
        }
    }

    normalizePhase(phase: string): ClinicalTrialPhase {
        if (phase === 'EtudePhase I') {
            return ClinicalTrialPhaseEnum.PHASE1;
        }
        if (phase === 'EtudePhase II') {
            return ClinicalTrialPhaseEnum.PHASE2;
        }
        if (phase === 'EtudePhase III') {
            return ClinicalTrialPhaseEnum.PHASE3;
        }
        if (phase === 'EtudePhase IV') {
            return ClinicalTrialPhaseEnum.PHASE4;
        }
    }



}// end of class


export type UnicancerTrial = {
    id?: string
    title?: string;
    status?: string;
    expertGroup?: string;
    tags?: string[];
    summary?: string;
    investigator?: string;
    studyPhase?: string;
    sponsor?: string;
    contact?: string;
    moreInfoLink?: string;
}