import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentTypeService } from '../services/payment-type.service';
import { PaymentType } from '../entities/payment-type.entity';

@Controller('payment-type')
@UseGuards(JwtAuthGuard)
export class PaymentTypeController {
  constructor(private readonly paymentTypeService: PaymentTypeService) {}

  @Get()
  async findAll(): Promise<PaymentType[]> {
    return this.paymentTypeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PaymentType> {
    return this.paymentTypeService.findOne(+id);
  }

  @Post()
  async create(@Body() data: Partial<PaymentType>): Promise<PaymentType> {
    return this.paymentTypeService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<PaymentType>): Promise<PaymentType> {
    return this.paymentTypeService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.paymentTypeService.remove(+id);
    return { message: 'Payment type deleted successfully' };
  }
}