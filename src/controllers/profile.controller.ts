import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileService } from '../services/profile.service';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.profileService.getProfile(req.user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() updateData: any) {
    return this.profileService.updateProfile(req.user.userId, updateData);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(@Request() req, @Body() changePasswordDto: { currentPassword: string; newPassword: string }) {
    return this.profileService.changePassword(req.user.userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }
}
