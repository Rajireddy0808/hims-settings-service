import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeeMastersService } from '../services/fee-masters.service';

@ApiTags('Fee Masters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fee-masters')
export class FeeMastersController {
  constructor(private readonly feeMastersService: FeeMastersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all fee masters' })
  async findAll() {
    return this.feeMastersService.findAll();
  }
}
