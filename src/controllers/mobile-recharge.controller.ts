import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { MobileRechargeService } from '../services/mobile-recharge.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Mobile Recharge')
@Controller('mobile-recharge')
export class MobileRechargeController {
  constructor(private readonly rechargeService: MobileRechargeService) {}

  @Post('operators')
  @ApiOperation({ summary: 'Create mobile operator' })
  async createOperator(@Body('name') name: string) {
    return this.rechargeService.createOperator(name);
  }

  @Get('operators')
  async getOperators() {
    return this.rechargeService.getOperators();
  }

  @Post('sims')
  @ApiOperation({ summary: 'Create SIM master' })
  async createSimMaster(@Body() data: { mobileNumber: string; operatorId: number }) {
    return this.rechargeService.createSimMaster(data.mobileNumber, data.operatorId);
  }

  @Get('sims')
  async getSimMasters() {
    return this.rechargeService.getSimMasters();
  }

  @Get('sims/unassigned')
  async getUnassignedSims() {
    return this.rechargeService.getUnassignedSims();
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create recharge plan (assign to employee)' })
  async createRechargePlan(@Body() data: any) {
    return this.rechargeService.createRechargePlan(data);
  }

  @Put('plans/:id')
  async updateRechargePlan(@Param('id') id: number, @Body() data: any) {
    return this.rechargeService.updateRechargePlan(id, data);
  }

  @Get('plans/employee-list')
  async getEmployeeRechargeList() {
    return this.rechargeService.getEmployeeRechargeList();
  }
  @Get('plans/history/:simMasterId')
  async getHistoryBySim(@Param('simMasterId') simMasterId: number) {
    return this.rechargeService.getHistoryBySim(simMasterId);
  }
}
