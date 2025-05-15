import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AccountsModule } from '@/accounts/accounts.module';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { AdminsModule } from 'src/admins/admins.module';
import { PatientsModule } from 'src/patients/patients.module';
import { InvestigatorsModule } from '@/investigators/investigators.module';

@Module({
  imports: [
    AccountsModule,
    AdminsModule,
    DoctorsModule,
    PatientsModule,
    InvestigatorsModule,
    PassportModule,
    JwtModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
