import { InvestigatorsService } from '@/investigators/investigators.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountsService } from 'src/accounts/accounts.service';
import { AdminsService } from 'src/admins/admins.service';
import { DoctorsService } from 'src/doctors/doctors.service';
import { TokenPayloadType } from 'src/lib/types/token-payload.type';
import { PatientsService } from 'src/patients/patients.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
    private readonly adminsService: AdminsService,
    private readonly investigatorsService: InvestigatorsService,
    private readonly accountsService: AccountsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: TokenPayloadType) {
    const account = await this.accountsService.findAccountById(payload.id);

    if (account.isBlocked)
      throw new UnauthorizedException(
        'Account is blocked please contact support',
      );

    switch (account.role) {
      case 'DOCTOR':
        const doctor = await this.doctorsService.findOneDoctorById(payload.id);
        return {
          id: doctor.doctor.id,
          email: doctor.account.email,
          firstName: doctor.doctor.firstName,
          lastName: doctor.doctor.lastName,
          image: doctor.doctor.image || '',
          role: doctor.account.role,
          isBlocked: doctor.account.isBlocked,
        };
      case 'PATIENT':
        const patient = await this.patientsService.findOnePatientById(
          payload.id,
        );
        return {
          id: patient.patient.id,
          email: patient.account.email,
          firstName: patient.patient.firstName,
          lastName: patient.patient.lastName,
          image: patient.patient.image || '',
          role: patient.account.role,
          isBlocked: patient.account.isBlocked,
        };

      case 'INVESTIGATOR':
        const investigator =
          await this.investigatorsService.findOneInvestigatorById(payload.id);

        return {
          id: investigator.investigator.id,
          email: investigator.account.email,
          firstName: investigator.investigator.firstName,
          lastName: investigator.investigator.lastName,
          image: investigator.investigator.image || '',
          role: investigator.account.role,
          isBlocked: investigator.account.isBlocked,
        };
      default:
        const admin = await this.adminsService.findOneAdminById(payload.id);
        return {
          id: admin.admin.id,
          email: admin.account.email,
          firstName: admin.admin.firstName,
          lastName: admin.admin.lastName,
          image: admin.admin.image || '',
          role: admin.account.role,
          isBlocked: admin.account.isBlocked,
        };
    }
  }
}
