import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { timeout, retry, catchError, map } from 'rxjs/operators';

@Injectable()
export class FieldMappingModelService {
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>('FIELD_MAPPING_SERVICE_URL');
    }

    async predictFieldMapping(data: { fields: string[] }): Promise<any> {
        try {
            return await firstValueFrom(
                this.httpService.post(`${this.baseUrl}/map-fields-batch`, data).pipe(
                    timeout(10000),
                    retry(3),
                    map(res => res.data)
                )
            );
        } catch (error) {
            console.error('Field mapping service error:', error);

            // Instead of HttpException, just throw a standard error
            throw new Error(`Failed to get field mapping prediction: ${error.message}`);
        }
    }
}

