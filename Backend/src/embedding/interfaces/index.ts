
// src/embedding/embedding-provider.abstract.ts
export abstract class EmbeddingProvider {
    abstract generateEmbedding(text: string): Promise<number[]>;
}