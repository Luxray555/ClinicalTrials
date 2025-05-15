import { IClinicalTrialsTransformer } from "@/lib/interfaces/clinical-trials-transformer-interface";
import { ClinicalTrial, ClinicalTrialPhase, Location, ClinicalTrialPhaseEnum, ClinicalTrialStatus, ClinicalTrialStatusEnum, ClinicalTrialType, ClinicalTrialTypeEnum, Condition, DataSourceNames, Gender, GenderEnum, Intervention, InterventionType, InterventionTypeEnum, SourceTypeEnum, Contact } from "@/lib/types/data-model";
import { CancerFrTrialCenter, CancerFrTrialData } from "../fetchers/cancer-fr-website/cancer-fr.fetcher.utils";
import { int } from "neo4j-driver";

// export class CancerFrTransformer implements IClinicalTrialsTransformer {
//     // transformClinicalTrialsData(data: any): ClinicalTrial[] {
//     //     throw new Error("Method not implemented.");
//     // }


//     /**
//  * Transforms extracted clinical trial data from the Cancer.fr website into the standardized ClinicalTrial format
//  * @param data The extracted data from the Cancer.fr website scraper
//  * @returns An array of ClinicalTrial objects conforming to the data model
//  */
// transformClinicalTrialsData(data: any[]): ClinicalTrial[] {
//     const transformedStudies: ClinicalTrial[] = [];

//     for (const trialData of data) {
//         try {
//             // Map the cancer.fr data to our ClinicalTrial model
//             const clinicalTrial: ClinicalTrial = {
//                 title: trialData.basicInfo?.title || "",
//                 summary: trialData.summary || "",
//                 status: this.mapTrialStatus(trialData.basicInfo?.status),
//                 phase: this.mapTrialPhase(trialData.trialCharacteristics?.Phase),
//                 type: this.mapTrialType(trialData.trialCharacteristics?.["Type de l'essai"]),

//                 // Sponsor information
//                 sponsor: {
//                     name: trialData.basicInfo?.promoter || "",
//                 },

//                 // Dates information
//                 dates: {
//                     startDate: this.formatDateIfValid(trialData.progress?.openingDateEffective),
//                     estimatedCompletionDate: this.formatDateIfValid(trialData.progress?.inclusionEndPlanned),
//                     lastUpdated: this.formatDateIfValid(trialData.basicInfo?.updateDate),
//                 },

//                 // Eligibility criteria
//                 eligibility: {
//                     gender: this.mapGender(trialData.basicInfo?.sex),
//                     minAge: this.extractAgeFromRange(trialData.basicInfo?.ageGroup)?.min,
//                     maxAge: this.extractAgeFromRange(trialData.basicInfo?.ageGroup)?.max,
//                     eligibilityCriteria: this.formatCriteria(
//                         trialData.scientificDetails?.inclusionCriteria,
//                         trialData.scientificDetails?.exclusionCriteria
//                     ),
//                 },

//                 // Conditions
//                 conditions: this.mapConditions(trialData.basicInfo?.cancerTypes),

//                 // Trial locations
//                 locations: this.mapLocations(trialData.participatingCenters),

//                 // Current enrollment count
//                 currentEnrollmentCount: trialData.progress?.actualInclusions?.allCountries 
//                     ? parseInt(trialData.progress.actualInclusions.allCountries, 10) 
//                     : undefined,

//                 // Interventions (derived from specialties)
//                 interventions: this.mapInterventions(trialData.basicInfo?.specialties),

//                 // Source metadata
//                 sourceMetaData: {
//                     originalSourceId: trialData.references?.["N°RECF"] || trialData.references?.["EudraCT/ID-RCB"] || "",
//                     trialSourceUrl: trialData.references?.["Liens d'intérêt"] || "",
//                     dataSource: {
//                         name: DataSourceNames.CANCER_FR,
//                         type: SourceTypeEnum.WEBSCRAPER,
//                     }
//                 }
//             };

//             transformedStudies.push(clinicalTrial);
//         } catch (error) {
//             console.error(`Error transforming trial data: ${error}`, trialData);
//         }
//     }

//     return transformedStudies;
// }

// /**
//  * Maps the status string from cancer.fr to our standardized ClinicalTrialStatus enum
//  */
// private mapTrialStatus(status?: string): ClinicalTrialStatus {
//     if (!status) return ClinicalTrialStatusEnum.UNKNOWN;

//     const statusMap: Record<string, ClinicalTrialStatus> = {
//         "ouvert aux inclusions": ClinicalTrialStatusEnum.RECRUITING,
//         "clos aux inclusions": ClinicalTrialStatusEnum.ACTIVE_NOT_RECRUITING,
//         "en cours de recrutement": ClinicalTrialStatusEnum.RECRUITING,
//         "clôturé": ClinicalTrialStatusEnum.COMPLETED,
//         "terminé": ClinicalTrialStatusEnum.COMPLETED,
//         "interrompu": ClinicalTrialStatusEnum.TERMINATED,
//         "suspendu": ClinicalTrialStatusEnum.SUSPENDED,
//     };

//     return statusMap[status.toLowerCase()] || ClinicalTrialStatusEnum.UNKNOWN;
// }

// /**
//  * Maps the gender string from cancer.fr to our standardized Gender enum
//  */
// private mapGender(genderStr?: string): Gender {
//     if (!genderStr) return GenderEnum.ALL;

//     if (genderStr.toLowerCase().includes("hommes") && genderStr.toLowerCase().includes("femmes")) {
//         return GenderEnum.ALL;
//     } else if (genderStr.toLowerCase().includes("hommes")) {
//         return GenderEnum.MALE;
//     } else if (genderStr.toLowerCase().includes("femmes")) {
//         return GenderEnum.FEMALE;
//     }

//     return GenderEnum.ALL;
// }

// /**
//  * Maps the phase string from cancer.fr to our standardized ClinicalTrialPhase enum
//  */
// private mapTrialPhase(phaseStr?: string): ClinicalTrialPhase {
//     if (!phaseStr) return ClinicalTrialPhaseEnum.NA;

//     const phaseMap: Record<string, ClinicalTrialPhase> = {
//         "1": ClinicalTrialPhaseEnum.PHASE1,
//         "2": ClinicalTrialPhaseEnum.PHASE2,
//         "3": ClinicalTrialPhaseEnum.PHASE3,
//         "4": ClinicalTrialPhaseEnum.PHASE4,
//         "1-2": ClinicalTrialPhaseEnum.PHASE1, // Could be improved with a combined phase type
//         "2-3": ClinicalTrialPhaseEnum.PHASE2, // Could be improved with a combined phase type
//     };

//     return phaseMap[phaseStr] || ClinicalTrialPhaseEnum.NA;
// }

// /**
//  * Maps the trial type string from cancer.fr to our standardized ClinicalTrialType enum
//  */
// private mapTrialType(typeStr?: string): ClinicalTrialType {
//     if (!typeStr) return ClinicalTrialTypeEnum.INTERVENTIONAL;

//     const typeMap: Record<string, ClinicalTrialType> = {
//         "thérapeutique": ClinicalTrialTypeEnum.INTERVENTIONAL,
//         "observationnel": ClinicalTrialTypeEnum.OBSERVATIONAL,
//         "accès étendu": ClinicalTrialTypeEnum.EXPANDED_ACCESS,
//     };

//     return typeMap[typeStr.toLowerCase()] || ClinicalTrialTypeEnum.INTERVENTIONAL;
// }

// /**
//  * Extracts minimum and maximum age from age range string
//  */
// private extractAgeFromRange(ageStr?: string): { min?: number, max?: number } | undefined {
//     if (!ageStr) return undefined;

//     // Handle "Supérieur ou égal à X ans"
//     const minAgeMatch = ageStr.match(/Supérieur ou égal à (\d+) ans/i);
//     if (minAgeMatch && minAgeMatch[1]) {
//         return { min: parseInt(minAgeMatch[1], 10) };
//     }

//     // Handle "Inférieur ou égal à X ans"
//     const maxAgeMatch = ageStr.match(/Inférieur ou égal à (\d+) ans/i);
//     if (maxAgeMatch && maxAgeMatch[1]) {
//         return { max: parseInt(maxAgeMatch[1], 10) };
//     }

//     // Handle "De X à Y ans"
//     const rangeMatch = ageStr.match(/De (\d+) à (\d+) ans/i);
//     if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
//         return {
//             min: parseInt(rangeMatch[1], 10),
//             max: parseInt(rangeMatch[2], 10)
//         };
//     }

//     return undefined;
// }

// /**
//  * Formats a date string to ISO 8601 format if valid
//  */
// private formatDateIfValid(dateStr?: string): string | undefined {
//     if (!dateStr || dateStr === '-') return undefined;

//     // Try parsing DD/MM/YYYY format
//     const parts = dateStr.split('/');
//     if (parts.length === 3) {
//         const day = parts[0].padStart(2, '0');
//         const month = parts[1].padStart(2, '0');
//         const year = parts[2];
//         return `${year}-${month}-${day}`;
//     }

//     // Already in ISO format
//     if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
//         return dateStr;
//     }

//     return undefined;
// }

// /**
//  * Formats inclusion and exclusion criteria into a single string
//  */
// private formatCriteria(inclusionCriteria?: string[], exclusionCriteria?: string[]): string {
//     let criteria = '';

//     if (inclusionCriteria && inclusionCriteria.length > 0) {
//         criteria += "Inclusion Criteria:\n";
//         inclusionCriteria.forEach((criterion, index) => {
//             criteria += `- ${criterion}\n`;
//         });
//     }

//     if (exclusionCriteria && exclusionCriteria.length > 0) {
//         if (criteria) criteria += "\n";
//         criteria += "Exclusion Criteria:\n";
//         exclusionCriteria.forEach((criterion, index) => {
//             criteria += `- ${criterion}\n`;
//         });
//     }

//     return criteria;
// }

// /**
//  * Maps cancer types to conditions
//  */
// private mapConditions(cancerTypes?: string[]): Condition[] {
//     if (!cancerTypes || cancerTypes.length === 0) {
//         return [];
//     }

//     return cancerTypes.map(type => ({
//         name: type
//     }));
// }

// /**
//  * Maps participating centers to locations
//  */
// private mapLocations(centers?: any[]): Location[] {
//     if (!centers || centers.length === 0) {
//         return [];
//     }

//     return centers.map(center => ({
//         facility: center.name || "",
//         city: this.extractCityFromAddress(center.address),
//         country: "France", // Default to France for cancer.fr
//         latitude: center.coordinates?.latitude || center.latitude,
//         longitude: center.coordinates?.longitude || center.longitude
//     }));
// }

// /**
//  * Extracts city from address string
//  */
// private extractCityFromAddress(address?: string): string | undefined {
//     if (!address) return undefined;

//     // Tries to extract a postal code followed by city name
//     const match = address.match(/\d{5}\s+([^\d,]+)/);
//     if (match && match[1]) {
//         return match[1].trim();
//     }

//     return undefined;
// }

// /**
//  * Maps specialties to interventions
//  */
// private mapInterventions(specialties?: string[]): Intervention[] {
//     if (!specialties || specialties.length === 0) {
//         return [];
//     }

//     return specialties.map(specialty => {
//         const interventionType = this.mapSpecialtyToInterventionType(specialty);
//         return {
//             name: specialty,
//             type: interventionType,
//             description: `Treatment using ${specialty}`
//         };
//     });
// }

// /**
//  * Maps specialty string to intervention type
//  */
// private mapSpecialtyToInterventionType(specialty?: string): InterventionType {
//     if (!specialty) return InterventionTypeEnum.OTHER;

//     const specialtyLower = specialty.toLowerCase();

//     if (specialtyLower.includes('chimiothérapie')) {
//         return InterventionTypeEnum.DRUG;
//     } else if (specialtyLower.includes('radiothérapie')) {
//         return InterventionTypeEnum.RADIATION;
//     } else if (specialtyLower.includes('immunothérapie')) {
//         return InterventionTypeEnum.BIOLOGICAL;
//     } else if (specialtyLower.includes('chirurgie')) {
//         return InterventionTypeEnum.PROCEDURE;
//     } else if (specialtyLower.includes('thérapies ciblées')) {
//         return InterventionTypeEnum.DRUG;
//     } else if (specialtyLower.includes('hormonothérapie')) {
//         return InterventionTypeEnum.DRUG;
//     }

//     return InterventionTypeEnum.OTHER;
// }
// }

export class CancerFrTransformer implements IClinicalTrialsTransformer {
    /**
 * Transforms extracted clinical trial data from the Cancer.fr website into the standardized ClinicalTrial format
 * @param data Array of CancerFrTrialData objects extracted from the Cancer.fr website
 * @returns An array of ClinicalTrial objects conforming to the data model
 */
    transformClinicalTrialsData(data: any): ClinicalTrial[] {
        console.log('data.trials.length in the transforer', data.trials.length)
        const transformedStudies: ClinicalTrial[] = [];
        const studies: CancerFrTrialData[] = data.trials
        dataSource: {
            name: DataSourceNames.CANCER_FR
        }
        for (const trialData of studies) {
            try {

                // Map the cancer.fr data to our ClinicalTrial model
                const clinicalTrial: ClinicalTrial = {
                    title: trialData.basicInfo.title,
                    summary: trialData.summary,
                    status: this.mapTrialStatus(trialData.basicInfo.status),
                    phase: this.mapTrialPhase(trialData.trialCharacteristics?.["Phase"]),
                    type: this.mapTrialType(trialData.trialCharacteristics?.["Type de l'essai"]),

                    // Sponsor information
                    sponsor: {
                        name: trialData.basicInfo.promoter,
                    },

                    // Dates information
                    dates: {
                        startDate: this.formatDateIfValid(trialData.progress.openingDateEffective),
                        estimatedCompletionDate: this.formatDateIfValid(trialData.progress.inclusionEndPlanned),
                        lastUpdated: this.formatDateIfValid(trialData.basicInfo.updateDate),
                    },

                    // Eligibility criteria
                    eligibility: {
                        gender: this.mapGender(trialData.basicInfo.sex),
                        minAge: this.extractAgeFromRange(trialData.basicInfo.ageGroup)?.min,
                        maxAge: this.extractAgeFromRange(trialData.basicInfo.ageGroup)?.max,
                        eligibilityCriteria: this.formatCriteria(
                            trialData.scientificDetails.inclusionCriteria,
                            trialData.scientificDetails.exclusionCriteria
                        ),
                    },

                    // Conditions
                    conditions: this.mapConditions(trialData.basicInfo.cancerTypes),

                    // Trial locations
                    locations: this.mapLocations(trialData.participatingCenters),

                    // // Current enrollment count
                    currentEnrollmentCount: trialData.progress.actualInclusions.allCountries !== "-"
                        ? int(trialData.progress.actualInclusions.allCountries)
                        : undefined,


                    // Interventions (derived from specialties)
                    interventions: this.mapInterventions(trialData.basicInfo.specialties),

                    // Add contacts from participating centers if available
                    contacts: this.extractContactsFromCenters(trialData.participatingCenters),

                    // Source metadata
                    sourceMetaData: {
                        originalSourceId: trialData.references?.["N°RECF"] || trialData.references?.["EudraCT/ID-RCB"] || trialData.id,
                        trialSourceUrl: trialData.references?.["Liens d'intérêt"] || "",
                        dataSource: {
                            name: DataSourceNames.CANCER_FR,
                            type: SourceTypeEnum.WEBSCRAPER,
                        }
                    }
                };

                transformedStudies.push(clinicalTrial);
            } catch (error) {
                console.error(`Error transforming trial data: ${error}`, trialData);
            }
        }

        return transformedStudies;
    }

    /**
     * Maps the status string from cancer.fr to our standardized ClinicalTrialStatus enum
     */
    private mapTrialStatus(status: string): ClinicalTrialStatus {
        if (!status) return ClinicalTrialStatusEnum.UNKNOWN;

        const statusMap: Record<string, ClinicalTrialStatus> = {
            "ouvert aux inclusions": ClinicalTrialStatusEnum.RECRUITING,
            "clos aux inclusions": ClinicalTrialStatusEnum.ACTIVE_NOT_RECRUITING,
            "en cours de recrutement": ClinicalTrialStatusEnum.RECRUITING,
            "clôturé": ClinicalTrialStatusEnum.COMPLETED,
            "terminé": ClinicalTrialStatusEnum.COMPLETED,
            "interrompu": ClinicalTrialStatusEnum.TERMINATED,
            "suspendu": ClinicalTrialStatusEnum.SUSPENDED,
        };

        return statusMap[status.toLowerCase()] || ClinicalTrialStatusEnum.UNKNOWN;
    }

    /**
     * Maps the gender string from cancer.fr to our standardized Gender enum
     */
    private mapGender(genderStr: string): Gender {
        if (!genderStr) return GenderEnum.ALL;

        if (genderStr.toLowerCase().includes("hommes") && genderStr.toLowerCase().includes("femmes")) {
            return GenderEnum.ALL;
        } else if (genderStr.toLowerCase().includes("hommes")) {
            return GenderEnum.MALE;
        } else if (genderStr.toLowerCase().includes("femmes")) {
            return GenderEnum.FEMALE;
        }

        return GenderEnum.ALL;
    }

    /**
     * Maps the phase string from cancer.fr to our standardized ClinicalTrialPhase enum
     */
    private mapTrialPhase(phaseStr: string): ClinicalTrialPhase {
        if (!phaseStr) return ClinicalTrialPhaseEnum.NA;

        const phaseMap: Record<string, ClinicalTrialPhase> = {
            "1": ClinicalTrialPhaseEnum.PHASE1,
            "2": ClinicalTrialPhaseEnum.PHASE2,
            "3": ClinicalTrialPhaseEnum.PHASE3,
            "4": ClinicalTrialPhaseEnum.PHASE4,
            "1-2": ClinicalTrialPhaseEnum.PHASE1, // Could be improved with a combined phase type
            "2-3": ClinicalTrialPhaseEnum.PHASE2, // Could be improved with a combined phase type
        };

        return phaseMap[phaseStr] || ClinicalTrialPhaseEnum.NA;
    }

    /**
     * Maps the trial type string from cancer.fr to our standardized ClinicalTrialType enum
     */
    private mapTrialType(typeStr: string): ClinicalTrialType {
        if (!typeStr) return ClinicalTrialTypeEnum.INTERVENTIONAL;

        const typeMap: Record<string, ClinicalTrialType> = {
            "thérapeutique": ClinicalTrialTypeEnum.INTERVENTIONAL,
            "observationnel": ClinicalTrialTypeEnum.OBSERVATIONAL,
            "accès étendu": ClinicalTrialTypeEnum.EXPANDED_ACCESS,
        };

        return typeMap[typeStr.toLowerCase()] || ClinicalTrialTypeEnum.INTERVENTIONAL;
    }

    /**
     * Extracts minimum and maximum age from age range string
     */
    private extractAgeFromRange(ageStr: string): { min?: number, max?: number } | undefined {
        if (!ageStr) return undefined;

        // Handle "Supérieur ou égal à X ans"
        const minAgeMatch = ageStr.match(/Supérieur ou égal à (\d+) ans/i);
        if (minAgeMatch && minAgeMatch[1]) {
            return { min: parseInt(minAgeMatch[1], 10) };
        }

        // Handle "Inférieur ou égal à X ans"
        const maxAgeMatch = ageStr.match(/Inférieur ou égal à (\d+) ans/i);
        if (maxAgeMatch && maxAgeMatch[1]) {
            return { max: parseInt(maxAgeMatch[1], 10) };
        }

        // Handle "De X à Y ans"
        const rangeMatch = ageStr.match(/De (\d+) à (\d+) ans/i);
        if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
            return {
                min: parseInt(rangeMatch[1], 10),
                max: parseInt(rangeMatch[2], 10)
            };
        }

        return undefined;
    }

    /**
     * Formats a date string to ISO 8601 format if valid
     */
    private formatDateIfValid(dateStr: string): string | undefined {
        if (!dateStr || dateStr === '-') return undefined;

        // Try parsing DD/MM/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }

        // Already in ISO format
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
        }

        return undefined;
    }

    /**
     * Formats inclusion and exclusion criteria into a single string
     */
    private formatCriteria(inclusionCriteria: string[], exclusionCriteria: string[]): string {
        let criteria = '';

        if (inclusionCriteria && inclusionCriteria.length > 0) {
            criteria += "Inclusion Criteria:\n";
            inclusionCriteria.forEach((criterion) => {
                criteria += `- ${criterion}\n`;
            });
        }

        if (exclusionCriteria && exclusionCriteria.length > 0) {
            if (criteria) criteria += "\n";
            criteria += "Exclusion Criteria:\n";
            exclusionCriteria.forEach((criterion) => {
                criteria += `- ${criterion}\n`;
            });
        }

        return criteria;
    }

    /**
     * Maps cancer types to conditions
     */
    private mapConditions(cancerTypes: string[]): Condition[] {
        if (!cancerTypes || cancerTypes.length === 0) {
            return [];
        }

        return cancerTypes.map(type => ({
            name: type
        }));
    }

    /**
     * Maps participating centers to locations
     */
    private mapLocations(centers: CancerFrTrialCenter[]): Location[] {
        if (!centers || centers.length === 0) {
            return [];
        }

        return centers.map(center => ({
            facility: center.name,
            city: this.extractCityFromAddress(center.address),
            country: "France", // Default to France for cancer.fr
            latitude: center.coordinates?.latitude,
            longitude: center.coordinates?.longitude
        }));
    }

    /**
     * Extracts contacts from participating centers
     */
    private extractContactsFromCenters(centers: CancerFrTrialCenter[]): Contact[] {
        if (!centers || centers.length === 0) {
            return [];
        }

        const contacts: Contact[] = [];

        centers.forEach((center, index) => {
            if (center.phone) {
                contacts.push({
                    name: center.name,
                    phone: center.phone,
                    isMainContact: index === 0 // First center as main contact
                });
            }
        });

        return contacts;
    }

    /**
     * Extracts city from address string
     */
    private extractCityFromAddress(address: string): string | undefined {
        if (!address) return undefined;

        // Tries to extract a postal code followed by city name
        const match = address.match(/\d{5}\s+([^\d,]+)/);
        if (match && match[1]) {
            return match[1].trim();
        }

        return undefined;
    }

    /**
     * Maps specialties to interventions
     */
    private mapInterventions(specialties: string[]): Intervention[] {
        if (!specialties || specialties.length === 0) {
            return [];
        }

        return specialties.map(specialty => {
            const interventionType = this.mapSpecialtyToInterventionType(specialty);
            return {
                name: specialty,
                type: interventionType,
                description: `Treatment using ${specialty}`
            };
        });
    }

    /**
     * Maps specialty string to intervention type
     */
    private mapSpecialtyToInterventionType(specialty: string): InterventionType {
        if (!specialty) return InterventionTypeEnum.OTHER;

        const specialtyLower = specialty.toLowerCase();

        if (specialtyLower.includes('chimiothérapie')) {
            return InterventionTypeEnum.DRUG;
        } else if (specialtyLower.includes('radiothérapie')) {
            return InterventionTypeEnum.RADIATION;
        } else if (specialtyLower.includes('immunothérapie')) {
            return InterventionTypeEnum.BIOLOGICAL;
        } else if (specialtyLower.includes('chirurgie')) {
            return InterventionTypeEnum.PROCEDURE;
        } else if (specialtyLower.includes('thérapies ciblées')) {
            return InterventionTypeEnum.DRUG;
        } else if (specialtyLower.includes('hormonothérapie')) {
            return InterventionTypeEnum.DRUG;
        }

        return InterventionTypeEnum.OTHER;
    }
}