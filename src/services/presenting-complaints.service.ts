import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PresentingComplaintsService {
    constructor(private dataSource: DataSource) { }

    async createTablesIfNotExist() {
        try {
            await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS patient_presenting_complaints (
          id SERIAL PRIMARY KEY,
          notes TEXT NOT NULL,
          patient_id INTEGER NOT NULL,
          created_by INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
        } catch (error) {
            console.error('Error creating patient_presenting_complaints table:', error);
        }
    }

    async savePatientPresentingComplaints(data: any, user: any) {
        try {
            await this.createTablesIfNotExist();

            const { patient_id, notes } = data;
            const created_by = user?.sub || user?.id || user?.userId || 1;

            const result = await this.dataSource.query(
                `INSERT INTO patient_presenting_complaints (notes, patient_id, created_by) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
                [notes, patient_id, created_by]
            );

            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Database error saving presenting complaints:', error);
            throw new Error('Failed to save presenting complaints');
        }
    }

    async getPatientPresentingComplaints(patientId: string) {
        try {
            await this.createTablesIfNotExist();

            const result = await this.dataSource.query(
                `SELECT ppc.*, u.first_name, u.last_name 
         FROM patient_presenting_complaints ppc
         LEFT JOIN users u ON ppc.created_by = u.id
         WHERE ppc.patient_id = $1
         ORDER BY ppc.created_at DESC`,
                [parseInt(patientId)]
            );

            return result;
        } catch (error) {
            console.error('Database error fetching presenting complaints:', error);
            throw new Error('Failed to fetch presenting complaints');
        }
    }
}
