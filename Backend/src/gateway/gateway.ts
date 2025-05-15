import { EtlPipelineService } from '@/etl-pipeline/etl-pipeline.service';
import { OnModuleInit, Injectable, Inject, forwardRef } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway({ cors: true })
export class MyGateway implements OnModuleInit {

    constructor(
        @Inject(forwardRef(() => EtlPipelineService))
        private readonly etlService: EtlPipelineService,
    ) { }

    @WebSocketServer()
    server: Server;

    onModuleInit() {
        this.server.on('connection', (socket) => {
            //send the pipelines states by emitting the event
            const pipelinesStates = this.etlService.getRunningPipelines();
            // console.log('pipelinesStates', pipelinesStates)
            this.emitPipelinesStates(pipelinesStates);
        });
    }


    emitPipelinesStates(payload: { collectionPipelines: any, refreshPipelines: any }) {
        this.server.emit('pipelines', payload);
    }


    TotalTrialsForAllSources(totalTrials: any) {
        this.server.emit('totalTrialsBySource', totalTrials);
    }




}
