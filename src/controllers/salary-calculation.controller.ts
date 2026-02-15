import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SalaryCalculationService } from '../services/salary-calculation.service';

@ApiTags('Settings - Salary Calculation')
@Controller('settings/salary-calculation')
export class SalaryCalculationController {
  constructor(private readonly salaryService: SalaryCalculationService) {}

  @Get('monthly')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Calculate monthly salary for all users' })
  calculateMonthlySalary(
    @Query('locationId') locationId: string,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    const currentDate = new Date();
    const monthNum = month ? parseInt(month) : currentDate.getMonth() + 1;
    const yearNum = year ? parseInt(year) : currentDate.getFullYear();
    return this.salaryService.calculateMonthlySalary(+locationId, monthNum, yearNum);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Calculate salary for specific user' })
  calculateUserSalary(
    @Query('userId') userId: string,
    @Query('locationId') locationId: string,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    const currentDate = new Date();
    const monthNum = month ? parseInt(month) : currentDate.getMonth() + 1;
    const yearNum = year ? parseInt(year) : currentDate.getFullYear();
    return this.salaryService.calculateUserSalary(+userId, +locationId, monthNum, yearNum);
  }
}
