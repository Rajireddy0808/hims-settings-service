import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TreatmentPlanMonthService } from '../services/treatment-plan-month.service';

@Controller('treatment-plan-month')
@UseGuards(JwtAuthGuard)
export class TreatmentPlanMonthController {
  constructor(private readonly treatmentPlanMonthService: TreatmentPlanMonthService) {}

  @Get()
  async findAll() {
    return this.treatmentPlanMonthService.findAll();
  }
}
