import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenderService } from '../services/gender.service';

@ApiTags('Master Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gender')
export class GenderController {
  constructor(private readonly genderService: GenderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all genders' })
  async findAll() {
    return this.genderService.findAll();
  }
}
