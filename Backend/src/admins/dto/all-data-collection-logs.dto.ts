import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetAllDataCollectionLogsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 10;

    @IsOptional()
    @IsString()
    @IsEnum({
        "DATA_LOADING": "DATA_LOADING",
        "DATA_REFRESHING": "DATA_REFRESHING",
    })
    type: string = null;


}
