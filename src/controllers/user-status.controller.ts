import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserStatusService } from '../services/user-status.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-status')
@UseGuards(JwtAuthGuard)
export class UserStatusController {
  constructor(private readonly userStatusService: UserStatusService) {}

  @Get()
  async findAll() {
    return await this.userStatusService.findAll();
  }
}
