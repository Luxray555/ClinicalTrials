// src/embedding/embedding.service.ts
import { EmbeddingProvider } from '@/embedding/interfaces';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
    constructor(
        // NestJS gives this manager the *specific worker* chosen by the factory below
        @Inject(EmbeddingProvider)
        private embeddingWorker: EmbeddingProvider
    ) { }

    async embedText(text: string): Promise<number[]> {
        // Delegate the job to the assigned worker
        return this.embeddingWorker.generateEmbedding(text);
    }
}