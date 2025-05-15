import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';  // ✅ Import HttpModule
import { ConfigModule } from '@nestjs/config';
import { FieldMappingModelService } from './field-mapping-model.service';

@Module({
    imports: [
        HttpModule.register({  // ✅ Register with default configs
            timeout: 5000,
            maxRedirects: 5,
        }),        // ✅ Ensure this is imported
        ConfigModule,      // ✅ Ensure config is available
    ],
    providers: [FieldMappingModelService],  // ✅ Register the service
    exports: [FieldMappingModelService],    // ✅ Allow other modules to use it
})
export class FieldMappingModule { }
