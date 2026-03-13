import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { Patient } from '../../entities/patient.entity';
import { Appointment } from '../../entities/appointment.entity';
import { Location } from '../../entities/location.entity';
import { Doctor } from '../../entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Appointment, Location, Doctor]),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
