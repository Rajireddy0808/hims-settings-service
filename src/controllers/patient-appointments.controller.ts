import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('patients')
export class PatientAppointmentsController {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  @Get(':id/appointments')
  async getPatientAppointments(@Param('id') id: string) {
    const appointments = await this.appointmentRepository.query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.notes,
        u.first_name as doctor_first_name,
        u.last_name as doctor_last_name,
        d.specialization
      FROM appointments a
      LEFT JOIN users u ON u.id = a.doctor_id
      LEFT JOIN doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC
    `, [parseInt(id)]);

    return {
      success: true,
      appointments: appointments.map(apt => ({
        id: apt.id,
        doctorName: `Dr. ${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim(),
        specialty: apt.specialization,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        status: apt.status,
        notes: apt.notes
      }))
    };
  }
}