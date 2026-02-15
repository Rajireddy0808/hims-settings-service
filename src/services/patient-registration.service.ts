import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Location } from '../entities/location.entity';
import * as crypto from 'crypto';

@Injectable()
export class PatientRegistrationService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async registerPatient(patientData: any, locationId: number, createdBy: number) {
    const {
      salutation, firstName, middleName, lastName, fatherSpouseName,
      gender, mobile, email, dateOfBirth, bloodGroup, maritalStatus,
      address1, district, state, country, pinCode, emergencyContact,
      medicalHistory, medicalConditions, fee, feeType, source,
      occupation, specialization, doctor, amount, password
    } = patientData;

    // Get location code
    const location = await this.locationRepository.findOne({ where: { id: locationId } });
    if (!location) {
      throw new Error('Location not found');
    }
    
    // Generate patient ID based on location code
    const locationCode = location.locationCode;
    const lastPatient = await this.patientRepository
      .createQueryBuilder('patient')
      .where(`patient.patient_id LIKE '${locationCode}%'`)
      .orderBy("CAST(SUBSTRING(patient.patient_id FROM LENGTH(:locationCode) + 1) AS INTEGER)", 'DESC')
      .setParameter('locationCode', locationCode)
      .getOne();

    const nextId = lastPatient 
      ? parseInt(lastPatient.patient_id.substring(locationCode.length)) + 1 
      : 1;
    const patientId = `${locationCode}${String(nextId).padStart(3, '0')}`;

    const patient = this.patientRepository.create({
      patient_id: patientId,
      location_id: locationId,
      created_by: createdBy,
      // Personal Information
      salutation,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      father_spouse_name: fatherSpouseName,
      // Demographics
      gender: gender?.toLowerCase(),
      date_of_birth: dateOfBirth,
      blood_group: bloodGroup,
      marital_status: maritalStatus,
      // Contact Information
      mobile,
      email,
      emergency_contact: emergencyContact,
      // Address Information
      address1,
      district: district || 'HYDERABAD',
      state: state || 'TELANGANA',
      country: country || 'INDIA',
      pin_code: pinCode,
      // Medical Information
      medical_history: medicalHistory,
      medical_conditions: medicalConditions,
      // Registration Information
      fee,
      fee_type: feeType,
      source,
      occupation,
      specialization,
      doctor,
      amount: amount ? parseFloat(amount) : null,
      password: password ? crypto.createHash('md5').update(password).digest('hex') : null
      // System fields (created_by, created_at, updated_at, status) are auto-generated
    });

    const savedPatient = await this.patientRepository.save(patient);

    return {
      message: 'Patient registered successfully',
      patient: {
        id: savedPatient.id,
        patientId: savedPatient.patient_id,
        name: `${savedPatient.first_name} ${savedPatient.last_name}`,
        status: savedPatient.status
      }
    };
  }
}
