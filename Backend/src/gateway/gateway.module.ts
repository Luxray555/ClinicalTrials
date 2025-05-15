import { forwardRef, Module } from "@nestjs/common";
import { MyGateway } from "./gateway";
import { EtlPipelineModule } from "@/etl-pipeline/etl-pipeline.module";

@Module({
    imports: [forwardRef(() => EtlPipelineModule)],
    providers: [MyGateway],
    exports: [MyGateway],
})
export class GatewayModule { }