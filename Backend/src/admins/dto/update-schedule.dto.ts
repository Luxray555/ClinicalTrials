import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsValidOrNotSet } from './custom-validators';

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}
export enum Frequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    MANUAL = 'MANUAL',
}

export class updateScheduleDto {
    @IsOptional()
    @IsValidOrNotSet({ type: 'enum', enumObject: DayOfWeek }, { message: 'Must be a valid day of week or "not set"' })
    dayOfWeek?: DayOfWeek | 'not set';

    @IsOptional()
    @IsValidOrNotSet({ type: 'number' }, { message: 'Must be a number or "not set"' })
    dayOfMonth?: number | 'not set';

    @IsOptional()
    @IsValidOrNotSet({ type: 'enum', enumObject: Frequency }, { message: 'Must be a valid frequency or "not set"' })
    frequency?: Frequency | 'not set';

    @IsOptional()
    @IsValidOrNotSet({ type: 'string' }, { message: 'Must be a string or "not set"' })
    timeOfDay?: string | 'not set';
}
