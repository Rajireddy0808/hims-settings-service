import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AllergiesService {
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

  async getAllergies() {
    try {
      const result = await this.pool.query('SELECT * FROM allergies ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch allergies');
    }
  }

  async getAllergiesOptions(allergiesId: number) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM allergies_options WHERE allergies_id = $1 ORDER BY id',
        [allergiesId]
      );
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch allergies options');
    }
  }

  async savePatientAllergies(data: any, user: any) {
    try {
      const { patient_id, allergies_id, allergies_option_id, category_title, option_title, notes } = data;

      // Add notes column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_allergies 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);

      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Handle only notes update if allergies_option_id is not provided
      if (!allergies_option_id && notes !== undefined) {
        // Update notes for all rows of this patient
        const updateResult = await this.pool.query(
          'UPDATE patient_allergies SET notes = $1 WHERE patient_id = $2 AND location_id = $3',
          [notes, patient_id, location_id]
        );

        if (updateResult.rowCount === 0) {
          // If no rows exist, insert a placeholder with notes
          await this.pool.query(
            'INSERT INTO patient_allergies (patient_id, allergies_id, allergies_option_id, category_title, option_title, location_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [patient_id, 1, 0, 'General', 'Notes Placeholder', location_id, notes]
          );
        }
        return { success: true, message: 'Notes updated' };
      }

      // Get numeric allergies_id from title string
      let numericAllergiesId = allergies_id;

      if (typeof allergies_id === 'string' && isNaN(Number(allergies_id))) {
        const allergiesResult = await this.pool.query(
          'SELECT id FROM allergies WHERE title ILIKE $1',
          [allergies_id]
        );

        if (allergiesResult.rows.length > 0) {
          numericAllergiesId = allergiesResult.rows[0].id;
        } else {
          numericAllergiesId = 1;
        }
      }

      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_allergies WHERE patient_id = $1 AND allergies_option_id = $2 AND location_id = $3',
        [patient_id, allergies_option_id, location_id]
      );

      if (existingRecord.rows.length > 0) {
        // Update notes even if record exists
        if (notes !== undefined) {
          await this.pool.query(
            'UPDATE patient_allergies SET notes = $1 WHERE patient_id = $2 AND location_id = $3',
            [notes, patient_id, location_id]
          );
        }
        return { message: 'Record already exists' };
      }

      // Propagate existing notes if not provided in request
      let finalNotes = notes;
      if (finalNotes === undefined || finalNotes === null || finalNotes === '') {
        const existingNoteResult = await this.pool.query(
          'SELECT notes FROM patient_allergies WHERE patient_id = $1 AND notes IS NOT NULL AND notes != \'\' LIMIT 1',
          [patient_id]
        );
        if (existingNoteResult.rows.length > 0) {
          finalNotes = existingNoteResult.rows[0].notes;
        }
      }

      const result = await this.pool.query(
        'INSERT INTO patient_allergies (patient_id, allergies_id, allergies_option_id, category_title, option_title, location_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [patient_id, numericAllergiesId, allergies_option_id, category_title, option_title, location_id, finalNotes]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save allergies');
    }
  }

  async getPatientAllergies(patientId: string, locationId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const locationIdRaw = locationId || user?.primary_location_id || user?.location_id || 1;
      const location_id = typeof locationIdRaw === 'string' ? parseInt(locationIdRaw.split(',')[0]) : locationIdRaw;

      // Add notes column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_allergies 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);

      const result = await this.pool.query(
        `SELECT pa.*, 
         COALESCE(a.title, pa.category_title) as allergies_title, 
         COALESCE(ao.title, pa.option_title) as option_title 
         FROM patient_allergies pa
         LEFT JOIN allergies a ON pa.allergies_id = a.id
         LEFT JOIN allergies_options ao ON pa.allergies_option_id = ao.id
         WHERE pa.patient_id = $1
         ORDER BY COALESCE(a.title, pa.category_title), COALESCE(ao.title, pa.option_title)`,
        [numericPatientId]
      );

      const groupedAllergies = result.rows.reduce((acc, row) => {
        const category = row.allergies_title;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: row.id,
          option_id: row.allergies_option_id,
          option_title: row.option_title
        });
        return acc;
      }, {});

      return {
        data: groupedAllergies,
        notes: result.rows.find(row => row.notes && row.notes.trim() !== '')?.notes || ''
      };
    } catch (error) {
      console.error('Error getting patient allergies:', error);
      throw new Error('Failed to fetch patient allergies');
    }
  }

  async deletePatientAllergies(data: any, user: any) {
    try {
      const { patient_id, allergies_option_id } = data;

      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      await this.pool.query(
        'DELETE FROM patient_allergies WHERE patient_id = $1 AND allergies_option_id = $2 AND location_id = $3',
        [patient_id, allergies_option_id, location_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete allergies');
    }
  }
}
