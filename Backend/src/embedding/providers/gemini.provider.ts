import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    EmbeddingProvider,
} from "../interfaces"
import { GoogleGenAI } from '@google/genai';
@Injectable()
export class GeminiEmbeddingProvider extends EmbeddingProvider {
    private genAI: GoogleGenAI; // Example SDK instance

    constructor(private readonly configService: ConfigService) {
        super();
        const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
        this.genAI = new GoogleGenAI({ apiKey });
    }

    async generateEmbedding(text: string): Promise<number[]> {


        const response = await this.genAI.models.embedContent({
            model: 'text-embedding-004',
            contents: [
                text,
            ],
            config: {
                outputDimensionality: 768,
            },
        });

        const embedding = response.embeddings[0].values

        return embedding;

    }
}