import { DataSourceName, DataSourceNames } from "@/lib/types/data-model";

export type logRecord = {
    id?: number;
    logInformation: string;
    logEventType: LogEventType;
    logContextId: number;
}

export const LogEvent = {
    DATA_LOADING: "DATA_LOADING",
    DATA_REFRESHING: "DATA_REFRESHING",
    DATA_SCAN: "DATA_SCAN",
    // DONE_LOADING_DATA: "DONE_LOADING_DATA",
    // DONE_REFRESHING_DATA: "DONE_REFRESHING_DATA",
    DONE: "DONE",
    NO_MORE_DATA_TO_LOAD: "NO_MORE_DATA_TO_LOAD",
    NO_MORE_DATA_TO_REFRESH: "NO_MORE_DATA_TO_REFRESH",
} as const


export type LogEventType = typeof LogEvent[keyof typeof LogEvent];

