import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MedicineDaysService } from '../services/medicine-days.service';

@Controller('medicine-days')
@UseGuards(JwtAuthGuard)
export class MedicineDaysController {
  constructor(private readonly medicineDaysService: MedicineDaysService) {}

  @Get()
  async findAll() {
    return this.medicineDaysService.findAll();
  }

  @Post()
  async create(@Body() data: { days: string }) {
    return this.medicineDaysService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: { days: string }) {
    return this.medicineDaysService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.medicineDaysService.remove(+id);
  }
}
