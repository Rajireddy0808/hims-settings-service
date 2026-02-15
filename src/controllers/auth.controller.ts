import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';

class LoginDto {
  username: string;
  password: string;
  userIp?: string;
}

class SwitchLocationDto {
  userId: number;
  locationId: number;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        summary: 'Admin Login',
        value: {
          username: 'admin',
          password: 'admin'
        }
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('switch-location')
  @ApiOperation({ summary: 'Switch user location and update permissions' })
  async switchLocation(@Body() switchLocationDto: SwitchLocationDto) {
    return this.authService.switchLocation(switchLocationDto.userId, switchLocationDto.locationId);
  }

  @Post('refresh-user-data')
  @ApiOperation({ summary: 'Refresh user data based on current location' })
  async refreshUserData(@Body() refreshDto: SwitchLocationDto) {
    return this.authService.switchLocation(refreshDto.userId, refreshDto.locationId);
  }
}
