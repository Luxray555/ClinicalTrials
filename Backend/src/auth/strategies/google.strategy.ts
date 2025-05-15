import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { DoctorsService } from 'src/doctors/doctors.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly doctorsService: DoctorsService,
  ) {
    super({
      clientID: configService.getOrThrow('AUTH_GOOGLE_ID'),
      clientSecret: configService.getOrThrow('AUTH_GOOGLE_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_AUTH_REDIRECT_URI'),
      scope: ['profile', 'email'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    // return this.doctorsService.createDoctor({
    //   email: profile.emails[0].value,
    //   firstName: profile.name.givenName,
    //   lastName: profile.name.familyName,
    //   image: profile.photos[0].value,
    //   gender: null,
    //   hospital: null,
    //   speciality: null,
    //   password: null,
    // });
  }
}
