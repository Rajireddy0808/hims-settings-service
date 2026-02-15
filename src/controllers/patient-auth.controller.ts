import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Controller('patients')
export class PatientAuthController {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    const { email, password } = loginData;

    if (!email || !password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    // Find patient by email
    const patient = await this.patientRepository.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!patient) {
      throw new HttpException('Patient not registered', HttpStatus.UNAUTHORIZED);
    }

    if (!patient.password) {
      throw new HttpException('Patient not registered for portal access', HttpStatus.UNAUTHORIZED);
    }

    // Verify password
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    if (patient.password !== hashedPassword) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: patient.id, 
        patientId: patient.patient_id,
        email: patient.email,
        type: 'patient'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      success: true,
      token,
      patient: {
        id: patient.id,
        patientId: patient.patient_id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        name: `${patient.first_name} ${patient.last_name}`,
        email: patient.email,
        mobile: patient.mobile
      }
    };
  }
}