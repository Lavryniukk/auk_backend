import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTPayload } from 'src/shared/user-payload.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtSecret = this.configService.get<string>('JWT_SECRET');
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Called guarded route');
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      console.log('No token found');
      throw new UnauthorizedException();
    }
    console.log('Token found: ', token);
    try {
      const payload: JWTPayload = await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
        ignoreExpiration: false,
      });

      console.log('Payload: ', payload);

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
