import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '3I3zCSdmG2Qt8X0lHvKkC5fsQp8Wfpx9MFdECFs9CS9Cu97GMrrpdptIxsP8sYPr',
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub,
      user_id: payload.sub,
      userId: payload.sub, 
      username: payload.username, 
      role_id: payload.role_id,
      location_id: payload.location_id 
    };
  }
}
