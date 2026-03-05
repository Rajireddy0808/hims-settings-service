import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DrugHistoryService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async getDrugHistory() {
    try {
      const result = await this.pool.query('SELECT * FROM drug_history ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch drug history');
    }
  }

  async getDrugHistoryOptions(historyId: number) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM drug_history_options WHERE drug_history_id = $1 ORDER BY id',
        [historyId]
      );
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch drug history options');
    }
  }

  async savePatientDrugHistory(data: any, user: any) {
    try {
      const { patient_id, drug_history_id, drug_history_option_id, category_title, option_title, notes } = data;

      // Add notes column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_drug_history 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);

      // Get location_id from user object or use selected_location_id from frontend
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Handle only notes update if drug_history_option_id is not provided
      if (!drug_history_option_id && notes !== undefined) {
        // Update notes for all rows of this patient
        const updateResult = await this.pool.query(
          'UPDATE patient_drug_history SET notes = $1 WHERE patient_id = $2 AND location_id = $3',
          [notes, patient_id, location_id]
        );

        if (updateResult.rowCount === 0) {
          // If no rows exist, insert a placeholder with notes
          await this.pool.query(
            'INSERT INTO patient_drug_history (patient_id, drug_history_id, drug_history_option_id, category_title, option_title, location_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [patient_id, 1, 0, 'General', 'Notes Placeholder', location_id, notes]
          );
        }
        return { success: true, message: 'Notes updated' };
      }

      // Get numeric drug_history_id from title string
      let numericDrugHistoryId = drug_history_id;

      if (typeof drug_history_id === 'string' && isNaN(Number(drug_history_id))) {
        const drugHistoryResult = await this.pool.query(
          'SELECT id FROM drug_history WHERE title ILIKE $1',
          [drug_history_id]
        );

        if (drugHistoryResult.rows.length > 0) {
          numericDrugHistoryId = drugHistoryResult.rows[0].id;
        } else {
          numericDrugHistoryId = 1;
        }
      }

      // Check if record already exists
      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_drug_history WHERE patient_id = $1 AND drug_history_option_id = $2 AND location_id = $3',
        [patient_id, drug_history_option_id, location_id]
      );

      if (existingRecord.rows.length > 0) {
        // Update notes even if record exists
        if (notes !== undefined) {
          await this.pool.query(
            'UPDATE patient_drug_history SET notes = $1 WHERE patient_id = $2 AND location_id = $3',
            [notes, patient_id, location_id]
          );
        }
        return { message: 'Record already exists' };
      }

      // Propagate existing notes if not provided in request
      let finalNotes = notes;
      if (finalNotes === undefined || finalNotes === null || finalNotes === '') {
        const existingNoteResult = await this.pool.query(
          'SELECT notes FROM patient_drug_history WHERE patient_id = $1 AND notes IS NOT NULL AND notes != \'\' LIMIT 1',
          [patient_id]
        );
        if (existingNoteResult.rows.length > 0) {
          finalNotes = existingNoteResult.rows[0].notes;
        }
      }

      // Insert new record with location_id
      const result = await this.pool.query(
        'INSERT INTO patient_drug_history (patient_id, drug_history_id, drug_history_option_id, category_title, option_title, location_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [patient_id, numericDrugHistoryId, drug_history_option_id, category_title, option_title, location_id, finalNotes]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save drug history');
    }
  }

  async getPatientDrugHistory(patientId: string, locationId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const locationIdRaw = locationId || user?.primary_location_id || user?.location_id || 1;
      const location_id = typeof locationIdRaw === 'string' ? parseInt(locationIdRaw.split(',')[0]) : locationIdRaw;

      // Add notes column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_drug_history 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);

      const result = await this.pool.query(
        `SELECT pdh.*, 
         COALESCE(dh.title, pdh.category_title) as drug_history_title, 
         COALESCE(dho.title, pdh.option_title) as option_title 
         FROM patient_drug_history pdh
         LEFT JOIN drug_history dh ON pdh.drug_history_id = dh.id
         LEFT JOIN drug_history_options dho ON pdh.drug_history_option_id = dho.id
         WHERE pdh.patient_id = $1
         ORDER BY COALESCE(dh.title, pdh.category_title), COALESCE(dho.title, pdh.option_title)`,
        [numericPatientId]
      );

      const groupedHistory = result.rows.reduce((acc, row) => {
        const category = row.drug_history_title;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: row.id,
          option_id: row.drug_history_option_id,
          option_title: row.option_title
        });
        return acc;
      }, {});

      return {
        data: groupedHistory,
        notes: result.rows.find(row => row.notes && row.notes.trim() !== '')?.notes || ''
      };
    } catch (error) {
      console.error('Error getting patient drug history:', error);
      throw new Error('Failed to fetch patient drug history');
    }
  }

  async deletePatientDrugHistory(data: any, user: any) {
    try {
      const { patient_id, drug_history_option_id } = data;

      // Get location_id from data or user object
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      await this.pool.query(
        'DELETE FROM patient_drug_history WHERE patient_id = $1 AND drug_history_option_id = $2 AND location_id = $3',
        [patient_id, drug_history_option_id, location_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete drug history');
    }
  }
}
