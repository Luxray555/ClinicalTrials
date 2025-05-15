// src/embedding/embedding.module.ts

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EmbeddingService } from "./embedding.service";
import { GeminiEmbeddingProvider } from "@/embedding/providers/gemini.provider";
import { HttpEmbeddingProvider } from "@/embedding/providers/http.provider";
import { EmbeddingProvider } from "@/embedding/interfaces";
import { HttpModule } from "@nestjs/axios";

// ... imports for providers, ConfigModule, etc. ...
@Module({
    imports: [ConfigModule, HttpModule.register({  // ✅ Register with default configs
        timeout: 5000,
        maxRedirects: 5,
    }),],
    providers: [
        EmbeddingService, // The manager
        // The workers
        GeminiEmbeddingProvider,
        HttpEmbeddingProvider,
        {
            provide: EmbeddingProvider,
            useFactory: (config, gemini, http) => { // Dependencies for the factory
                const type = config.get('EMBEDDING_PROVIDER_TYPE');
                if (type === 'gemini') return gemini;
                if (type === 'http') return http;
                return gemini;
            },
            inject: [ConfigService, GeminiEmbeddingProvider, HttpEmbeddingProvider],
        }
    ],
    exports: [EmbeddingService] // Export the manager
})
export class EmbeddingModule { }