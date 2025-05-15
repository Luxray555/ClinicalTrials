import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginPayloadDto } from './dto/login-payload.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { TokenPayloadType } from '../lib/types/token-payload.type';
import { CurrentUserType } from 'src/lib/types/current-user.type';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { DoctorsService } from 'src/doctors/doctors.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { PatientsService } from 'src/patients/patients.service';
import { AdminsService } from 'src/admins/admins.service';
import { InvestigatorsService } from '@/investigators/investigators.service';
import { RegisterInvestigatorDto } from './dto/register-investigator.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly adminsService: AdminsService,
    private readonly doctorsService: DoctorsService,
    private readonly patientsService: PatientsService,
    private readonly investigatorsService: InvestigatorsService,
    private readonly accountsService: AccountsService,
  ) {}

  async registerDoctor(registerDoctorDto: RegisterDoctorDto) {
    return this.doctorsService.createDoctor(registerDoctorDto);
  }

  async registerInvestigator(registerInvestigatorDto: RegisterInvestigatorDto) {
    return this.investigatorsService.createInvestigator(
      registerInvestigatorDto,
    );
  }

  async login(user: CurrentUserType, response: Response, redirect = false) {
    const expiresAccessToken = new Date();
    expiresAccessToken.setMilliseconds(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setMilliseconds(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayloadType = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      image: user.image,
      isBlocked: user.isBlocked,
    };

    const access_token = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS')}ms`,
    });

    const refresh_token = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_MS')}ms`,
    });

    this.accountsService.updateAccountRefreshTokenById(
      user.id,
      await bcrypt.hash(refresh_token, 10),
    );

    response.cookie('Authentication', access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresAccessToken,
    });

    response.cookie('Refresh', refresh_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expiresRefreshToken,
    });

    if (redirect) {
      response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT_URI'));
    }
  }

  async logout(response: Response) {
    response.clearCookie('Authentication');
    response.clearCookie('Refresh');
  }

  async verifyUserRefreshToken(refreshToken: string, accountId: string) {
    const account = await this.accountsService.findAccountById(accountId);

    if (account.isBlocked)
      throw new UnauthorizedException(
        'Account is blocked please contact support',
      );

    const refreshTokenFromDb =
      await this.accountsService.findAccountRefreshTokenById(account.id);

    const authenticated = await bcrypt.compare(
      refreshToken,
      refreshTokenFromDb,
    );

    if (!authenticated) throw new UnauthorizedException();

    switch (account.role) {
      case 'DOCTOR':
        const doctor = await this.doctorsService.findOneDoctorById(account.id);
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
          account.id,
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
          await this.investigatorsService.findOneInvestigatorById(account.id);
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
        const admin = await this.adminsService.findOneAdminById(account.id);
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

  async verifyUser(loginPayloadDto: LoginPayloadDto) {
    const account = await this.accountsService.findAccountByEmail(
      loginPayloadDto.email,
    );

    if (account.isBlocked)
      throw new UnauthorizedException(
        'Account is blocked please contact support',
      );

    const authenticated = await bcrypt.compare(
      loginPayloadDto.password,
      account.password,
    );

    if (!authenticated) throw new UnauthorizedException('Invalid credentials');

    let user;

    switch (account.role) {
      case 'DOCTOR':
        const doctor = await this.doctorsService.findOneDoctorById(account.id);
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
          account.id,
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
          await this.investigatorsService.findOneInvestigatorById(account.id);
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
        const admin = await this.adminsService.findOneAdminById(account.id);
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
