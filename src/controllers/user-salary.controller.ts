import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserSalaryService } from '../services/user-salary.service';

@ApiTags('Settings - User Salary')
@Controller('settings/user-salary')
export class UserSalaryController {
  constructor(private readonly salaryService: UserSalaryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create salary details' })
  create(@Body() data: any) {
    return this.salaryService.create(data);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get salary details by user ID' })
  findByUserId(@Param('userId') userId: string) {
    return this.salaryService.findByUserId(+userId);
  }
}
