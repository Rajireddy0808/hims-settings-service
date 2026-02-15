import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserLocationService } from './user-location.service';

@Injectable()
export class PrescriptionService {
  constructor(
    private readonly userLocationService: UserLocationService,
    private dataSource: DataSource
  ) {}

  async savePatientPrescriptions(data: any, user: any) {
    try {
      const { 
        patient_id, 
        prescriptions, 
        medicine_days, 
        next_appointment_date, 
        notes_to_pro, 
        notes_to_pharmacy 
      } = data;
      
      const userId = user?.sub || user?.id || user?.userId;
      const location_id = userId ? await this.userLocationService.getUserLocationId(userId) : 1;
      const created_by = userId;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Create tables if they don't exist
      await this.createTablesIfNotExist();

      // Insert main prescription record
      const prescriptionResult = await this.dataSource.query(
        `INSERT INTO patient_prescriptions 
         (patient_id, location_id, medicine_days, next_appointment_date, 
          notes_to_pro, notes_to_pharmacy, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [patient_id, location_id, medicine_days, next_appointment_date, notes_to_pro, notes_to_pharmacy, created_by]
      );

      const prescriptionId = prescriptionResult[0].id;
      
      // Insert medicines for this prescription
      const medicineResults = [];
      for (const prescription of prescriptions) {
        const result = await this.dataSource.query(
          `INSERT INTO prescription_medicines 
           (patient_prescriptions_id, medicine_type, medicine, potency, dosage, 
            morning, afternoon, night, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING id`,
          [
            prescriptionId, prescription.medicineType, prescription.medicine,
            prescription.potency, prescription.dosage, prescription.morning,
            prescription.afternoon, prescription.night, prescription.notes
          ]
        );
        medicineResults.push(result[0].id);
      }

      return { success: true, prescriptionId, medicineIds: medicineResults };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save prescriptions');
    }
  }

  private async createTablesIfNotExist() {
    try {
      // Create patient_prescriptions table
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS patient_prescriptions (
          id SERIAL PRIMARY KEY,
          patient_id INTEGER NOT NULL,
          location_id INTEGER NOT NULL,
          medicine_days INTEGER,
          next_appointment_date DATE,
          notes_to_pro TEXT,
          notes_to_pharmacy TEXT,
          created_by INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create prescription_medicines table
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS prescription_medicines (
          id SERIAL PRIMARY KEY,
          patient_prescriptions_id INTEGER REFERENCES patient_prescriptions(id) ON DELETE CASCADE,
          medicine_type VARCHAR(255),
          medicine VARCHAR(255),
          potency VARCHAR(255),
          dosage VARCHAR(255),
          morning BOOLEAN DEFAULT FALSE,
          afternoon BOOLEAN DEFAULT FALSE,
          night BOOLEAN DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  async getPatientPrescriptions(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const userId = user?.sub || user?.id || user?.userId;
      const locationId = userId ? await this.userLocationService.getUserLocationId(userId) : 1;

      // First check if tables exist, if not return empty array
      const tableCheck = await this.dataSource.query(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_name = 'patient_prescriptions'
         )`
      );
      
      if (!tableCheck[0].exists) {
        return [];
      }

      const result = await this.dataSource.query(
        `SELECT pp.*, pm.medicine_type, pm.medicine, pm.potency, pm.dosage,
                pm.morning, pm.afternoon, pm.night, pm.notes as medicine_notes
         FROM patient_prescriptions pp
         LEFT JOIN prescription_medicines pm ON pp.id = pm.patient_prescriptions_id
         WHERE pp.patient_id = $1 AND pp.location_id = $2
         ORDER BY pp.created_at DESC, pm.id`,
        [numericPatientId, locationId]
      );

      return result;
    } catch (error) {
      console.error('Error getting patient prescriptions:', error);
      return [];
    }
  }

  async deletePatientPrescription(id: number, user: any) {
    try {
      const location_id = user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      await this.dataSource.query(
        'DELETE FROM patient_prescriptions WHERE id = $1 AND location_id = $2',
        [id, location_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete prescription');
    }
  }
}
