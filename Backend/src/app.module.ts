import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClinicalTrialsModule } from './clinical-trials/clinical-trials.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { EtlPipelineModule } from './etl-pipeline/etl-pipeline.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { Neo4jModule } from './neo4j/neo4j.module';
import { AdminsModule } from './admins/admins.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AccountsModule } from './accounts/accounts.module';
import { RolesGuard } from './lib/guards/roles.guard';
import { PostgresModule } from './postgres/postgres.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerService } from './logger/logger.service';
import { CsvService } from './csv/csv.service';
import { FieldMappingModelService } from './field-mapping-model/field-mapping-model.service';
import { FieldMappingModule } from './field-mapping-model/field-mapping-model.module';
import { InvestigatorsModule } from './investigators/investigators.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule.forRootAsync(),
    PostgresModule,
    AuthModule,
    GatewayModule,
    AccountsModule,
    AdminsModule,
    DoctorsModule,
    PatientsModule,
    ClinicalTrialsModule,
    RecommendationModule,
    EtlPipelineModule,
    NotificationsModule,
    InvestigatorsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    LoggerService,
    CsvService,
  ],
})
export class AppModule { }
