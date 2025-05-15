export type SystemStats = {
    users: UsersStats;
    // clinicalTrials: ClinicalTrialsStats;
    clinicalTrials: any;
    // dataSources: DataSourcesStats;
    dataSources: any;
}

export type UsersStats = {
    doctors: number;
    patients: number;
    investigators: number;
    admins: number;
    total: number;
}

export type ClinicalTrialsStats = {
    total: number;
    // active: number;
    // inactive: number;
}
export type DataSourcesStats = {
    total: number;
}