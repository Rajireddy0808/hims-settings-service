import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BloodGroupService } from '../services/blood-group.service';

@ApiTags('Master Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blood-group')
export class BloodGroupController {
  constructor(private readonly bloodGroupService: BloodGroupService) {}

  @Get()
  @ApiOperation({ summary: 'Get all blood groups' })
  async findAll() {
    return this.bloodGroupService.findAll();
  }
}
