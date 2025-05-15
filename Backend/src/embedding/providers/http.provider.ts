import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Make sure HttpModule is imported
import { ConfigService } from '@nestjs/config';
import {
    EmbeddingProvider,
} from "../interfaces"

@Injectable()
export class HttpEmbeddingProvider extends EmbeddingProvider {
    private readonly recommendationServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        super();
        this.recommendationServiceUrl = this.configService.getOrThrow<string>(
            'EMBEDDING_API_URL', // Get URL from .env
        );
    }

    generateEmbedding(text: string): Promise<number[]> {
        throw new Error('Method not implemented.');
    }
}