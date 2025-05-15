import { createId } from '@paralleldrive/cuid2';
import { ClinicalTrialGovApiResponse, ClinicalTrialGovStudy } from "../fetchers/clinical-trials-gov-api/clinical-trials-gov.utils";
import { ClinicalTrial, ClinicalTrialDates, ClinicalTrialStatus, Collaborator, Condition, Contact, DataSource, DataSourceNames, Eligibility, Intervention, Location, SourceMetaData, SourceTypeEnum, Sponsor } from "@/lib/types/data-model";
import { int } from 'neo4j-driver';
import { IClinicalTrialsTransformer } from '@/lib/interfaces/clinical-trials-transformer-interface';



export const MAPPER = {
    "conditions": { apiFieldName: "protocolSection.conditionsModule.conditions" },
    "interventions": { apiFieldName: ".protocolSection.armsInterventionsModule.interventions" },
    "sponsors": { apiFieldName: ".protocolSection.sponsorCollaboratorsModule.leadSponsor" },
    "collaborators": { apiFieldName: ".protocolSection.sponsorCollaboratorsModule.collaborators" },
    "eligibility": { apiFieldName: ".protocolSection.eligibilityModule" },
    "contacts": { apiFieldName: ".protocolSection.contactsLocationsModule.centralContacts" },
    "mainContact": { apiFieldName: ".resultsSection.moreInfoModule.pointOfContact" },
    "location": { apiFieldName: ".protocolSection.contactsLocationsModule.locations" },
    "dates": { apiFieldName: ".protocolSection.statusModule" },
    "clinicalTrialDescription": { apiFieldName: ".protocolSection.descriptionModule" },
    "clinicalTrialTypePhaseEnrollement": { apiFieldName: ".protocolSection.designModule" },
    "clinicalTrialIdentification": { apiFieldName: ".protocolSection.identificationModule" },
}

export class ClinicalTrialsGovTransformer implements IClinicalTrialsTransformer {


    private accessStudy(study: ClinicalTrialGovStudy, path: string): Iterable<any> | any {
        try {
            // Validate inputs
            if (!study || !path) {
                return [];
            }

            let pathArray = path.split(".")
                .filter((path: string) => path !== "");

            let currentObject: any = study;

            // Traverse the path safely
            for (const pathSegment of pathArray) {
                // Check if current object exists and has the property
                if (currentObject && typeof currentObject === 'object' && pathSegment in currentObject) {
                    currentObject = currentObject[pathSegment];
                } else {

                    return [];
                }
            }

            // Handle the result
            if (currentObject === null || currentObject === undefined) {
                return [];
            }

            if (Array.isArray(currentObject)) {
                return currentObject;
            }

            return [currentObject];

        } catch (error) {
            console.error('Error accessing study path:', {
                error,
                path,
                studyId: study.protocolSection.identificationModule.nctId || 'unknown'
            });
            return [];
        }
    }

    private createConditions(study: ClinicalTrialGovStudy): Condition[] {
        return this.accessStudy(study, MAPPER.conditions.apiFieldName).map((condition: any, index: any): Condition => {
            return {
                name: condition,
            }
        })
    }
    private createContacts(study: ClinicalTrialGovStudy): Contact[] {
        let contactList: Contact[] = [];

        const contacts = this.accessStudy(study, MAPPER.contacts.apiFieldName);
        const mainContact = this.accessStudy(study, MAPPER.mainContact.apiFieldName)[0];


        contactList = contacts.map((contact: any, index: any): Contact => {
            return {
                email: contact?.email,
                name: contact?.name,
                phone: contact?.phone,
            }
        })

        if (mainContact) {
            contactList.push({
                email: mainContact?.email,
                name: mainContact?.title,
                phone: mainContact?.phone,
                isMainContact: true,
            })
        }

        return contactList;
    }


    private createInterventions(study: ClinicalTrialGovStudy): Intervention[] {
        return this.accessStudy(study, MAPPER.interventions.apiFieldName).map((intervention: any, index: any): Intervention => {

            return {
                name: intervention?.name,
                type: intervention?.type,
                description: intervention?.description,
            }
        })
    }

    private createSponsor(study: ClinicalTrialGovStudy): Sponsor {
        return this.accessStudy(study, MAPPER.sponsors.apiFieldName).map((sponsor: any, index: any): Sponsor => {
            return {
                name: sponsor?.name,
            }
        })[0]
    }

    private createCollaborators(study: ClinicalTrialGovStudy): Collaborator[] {

        return this.accessStudy(study, MAPPER.collaborators.apiFieldName).map((collaborator: any, index: any): Collaborator => {
            return {
                name: collaborator?.name,
            }
        })
    }

    private createClinicalTrialDates(study: ClinicalTrialGovStudy): ClinicalTrialDates {

        return this.accessStudy(study, MAPPER.dates.apiFieldName).map((date: any, index: any): ClinicalTrialDates => {
            return {
                estimatedCompletionDate: date?.completionDateStruct?.date,
                startDate: date?.startDateStruct?.date,
                lastUpdatedOnSource: date?.lastUpdatePostDateStruct.date ? date.lastUpdatePostDateStruct.date : date?.lastUpdateSubmitDateStruct.date,
                // lastFetched: new Date().toISOString(),
                // lastUpdated: new Date().toISOString(),

            }
        })[0]
    }

    private createEligibility(study: ClinicalTrialGovStudy): Eligibility {
        return this.accessStudy(study, MAPPER.eligibility.apiFieldName).map((eligibility: any, index: any): Eligibility => {
            return {

                eligibilityCriteria: eligibility?.eligibilityCriteria,
                gender: eligibility?.sex,
                maxAge: eligibility?.maximumAge ? parseInt(eligibility.maximumAge.match(/\d+/)?.[0] || "0") : undefined,
                minAge: eligibility?.minimumAge ? parseInt(eligibility.minimumAge.match(/\d+/)?.[0] || "0") : undefined,

            }
        })[0]
    }

    private createLocations(study: ClinicalTrialGovStudy): Location[] {
        return this.accessStudy(study, MAPPER.location.apiFieldName).map((location: any, index: any): Location => {
            return {
                city: location?.city,
                country: location?.country,
                latitude: location?.geoPoint?.lat,
                longitude: location?.geoPoint?.lon,
                facility: location?.facility,
            }
        })
    }


    private createSourceMetaData(study: ClinicalTrialGovStudy): SourceMetaData {
        const ct = this.accessStudy(study, MAPPER.clinicalTrialIdentification.apiFieldName)[0]
        return {
            originalSourceId: ct?.nctId,
            trialSourceUrl: `https://clinicaltrials.gov/study/${study.protocolSection?.identificationModule?.nctId}`,
            dataSource: {
                name: DataSourceNames.CLINICAL_TRIALS_GOV,
            }
        }

    }


    private linkDataModel(
        sponsor: Sponsor,
        collaborators: Collaborator[],
        interventions: Intervention[],
        condition: Condition[],
        dates: ClinicalTrialDates,
        eligibility: Eligibility,
        locations: Location[],
        constacts: Contact[],
        clinicalTrial: ClinicalTrial,
        sourceMetaData: SourceMetaData,
    ): ClinicalTrial {


        return {
            collaborators: collaborators,
            conditions: condition,
            dates: dates,
            eligibility: eligibility,
            interventions: interventions,
            locations: locations,
            sponsor: sponsor,
            contacts: constacts,
            sourceMetaData: sourceMetaData,
            ...clinicalTrial,
        }

    }


    private createClinicalTrial(study: any): ClinicalTrial {

        let clinicalTrial: ClinicalTrial = {}

        clinicalTrial = this.accessStudy(study, MAPPER.clinicalTrialIdentification.apiFieldName).map((ct: any, index: any): ClinicalTrial => {
            return {
                // originalSourceId: ct?.nctId,
                title: ct?.officialTitle ? ct.officialTitle : ct?.briefTitle ? ct.briefTitle : "Unavailable",
                organization: ct?.organization?.fullName,
            }
        })[0]

        clinicalTrial = this.accessStudy(study, MAPPER.clinicalTrialTypePhaseEnrollement.apiFieldName).map((ct: any, index: any): ClinicalTrial => {
            return {
                ...clinicalTrial,
                type: ct?.studyType,
                phase: ct?.phases?.length > 0 ? ct.phases[0] : null,
                currentEnrollmentCount: ct?.enrollmentInfo?.count != null && int(ct?.enrollmentInfo?.count)
            }
        })[0]


        clinicalTrial = this.accessStudy(study, MAPPER.clinicalTrialDescription.apiFieldName).map((ct: any, index: any): ClinicalTrial => {
            return {
                ...clinicalTrial,
                summary: ct?.detailedDescription ? ct.detailedDescription : ct?.briefSummary ? ct.briefSummary : "Unavailable"
            }
        })[0]


        clinicalTrial = this.accessStudy(study, MAPPER.dates.apiFieldName).map((ct: any, index: any): ClinicalTrial => {
            return {
                ...clinicalTrial,
                status: ct?.overallStatus,
            }
        })[0]


        return clinicalTrial;



    } // end of createClinicalTrial;


    private transformOneClinicalTrialsGovData(apiStudy: ClinicalTrialGovStudy): ClinicalTrial {
        if (apiStudy?.protocolSection?.identificationModule.nctId == null) {
            throw new Error('Study does not have an NCT ID');
            return null;
        }
        let transformedStudy = {};

        // this section to store our data model 
        const sponsor = this.createSponsor(apiStudy)

        const collaborators = this.createCollaborators(apiStudy)

        const interventions = this.createInterventions(apiStudy)

        const condition = this.createConditions(apiStudy)

        const dates = this.createClinicalTrialDates(apiStudy)

        const eligibility = this.createEligibility(apiStudy)

        const locations = this.createLocations(apiStudy)

        const contacts = this.createContacts(apiStudy)

        const clinicalTrial = this.createClinicalTrial(apiStudy)

        const sourceMetaData = this.createSourceMetaData(apiStudy)

        transformedStudy = this.linkDataModel(sponsor, collaborators, interventions, condition, dates, eligibility, locations, contacts, clinicalTrial, sourceMetaData);

        return transformedStudy;
    }

    transformClinicalTrialsData(data: any): ClinicalTrial[] {
        const clinicalTrialApiResult: ClinicalTrialGovApiResponse = data
        let transformedStudies: ClinicalTrial[] = [];
        transformedStudies = clinicalTrialApiResult.studies.map((apiStudy: ClinicalTrialGovStudy): ClinicalTrial => {
            return this.transformOneClinicalTrialsGovData(apiStudy);
        })

        return transformedStudies;
    }


}