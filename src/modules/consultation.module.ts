import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationController } from '../controllers/consultation.controller';
import { ConsultationService } from '../services/consultation.service';
import { Consultation } from '../entities/consultation.entity';
import { ConsultationPayment } from '../entities/consultation-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consultation, ConsultationPayment])],
  controllers: [ConsultationController],
  providers: [ConsultationService],
  exports: [ConsultationService],
})
export class ConsultationModule {}
