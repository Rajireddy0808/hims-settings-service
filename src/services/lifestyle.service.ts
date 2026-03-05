import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class LifestyleService {
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

  async getLifestyle() {
    try {
      const result = await this.pool.query('SELECT * FROM lifestyle ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch lifestyle');
    }
  }

  async getLifestyleOptions(lifestyleId: number) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM lifestyle_options WHERE lifestyle_id = $1 ORDER BY id',
        [lifestyleId]
      );
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch lifestyle options');
    }
  }

  async savePatientLifestyle(data: any, user: any) {
    try {
      const { patient_id, lifestyle_id, lifestyle_option_id, category_title, option_title, notes } = data;
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      // Add notes column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_lifestyle 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);

      // Handle only notes update if lifestyle_option_id is not provided
      if (!lifestyle_option_id && notes !== undefined) {
        // Update notes for all rows of this patient
        const updateResult = await this.pool.query(
          'UPDATE patient_lifestyle SET notes = $1 WHERE patient_id = $2 AND location_id = $3',
          [notes, patient_id, location_id]
        );

        if (updateResult.rowCount === 0) {
          // If no rows exist, insert a placeholder with notes
          await this.pool.query(
            'INSERT INTO patient_lifestyle (patient_id, lifestyle_id, lifestyle_option_id, category_title, option_title, location_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [patient_id, 1, 0, 'General', 'Notes Placeholder', location_id, notes]
          );
        }
        return { success: true, message: 'Notes updated' };
      }

      // Get numeric lifestyle_id from title string
      let numericLifestyleId = lifestyle_id;

      if (typeof lifestyle_id === 'string' && isNaN(Number(lifestyle_id))) {
        const lifestyleResult = await this.pool.query(
          'SELECT id FROM lifestyle WHERE title ILIKE $1',
          [lifestyle_id]
        );

        if (lifestyleResult.rows.length > 0) {
          numericLifestyleId = lifestyleResult.rows[0].id;
        } else {
          numericLifestyleId = 1;
        }
      }

      // Check if record already exists
      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_lifestyle WHERE patient_id = $1 AND lifestyle_option_id = $2 AND location_id = $3',
        [patient_id, lifestyle_option_id, location_id]
      );

      if (existingRecord.rows.length > 0) {
        // Update notes even if record exists
        if (notes !== undefined) {
          await this.pool.query(
            'UPDATE patient_lifestyle SET notes = $1 WHERE patient_id = $2 AND location_id = $3',
            [notes, patient_id, location_id]
          );
        }
        return { message: 'Record already exists' };
      }

      // Propagate existing notes if not provided in request
      let finalNotes = notes;
      if (finalNotes === undefined || finalNotes === null || finalNotes === '') {
        const existingNoteResult = await this.pool.query(
          'SELECT notes FROM patient_lifestyle WHERE patient_id = $1 AND notes IS NOT NULL AND notes != \'\' LIMIT 1',
          [patient_id]
        );
        if (existingNoteResult.rows.length > 0) {
          finalNotes = existingNoteResult.rows[0].notes;
        }
      }

      // Insert new record with location_id
      const result = await this.pool.query(
        'INSERT INTO patient_lifestyle (patient_id, lifestyle_id, lifestyle_option_id, category_title, option_title, location_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [patient_id, numericLifestyleId, lifestyle_option_id, category_title, option_title, location_id, finalNotes]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save lifestyle');
    }
  }

  async getPatientLifestyle(patientId: string, locationId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const locationIdRaw = locationId || user?.primary_location_id || user?.location_id || 1;
      const location_id = typeof locationIdRaw === 'string' ? parseInt(locationIdRaw.split(',')[0]) : locationIdRaw;

      // Add notes column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_lifestyle 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);

      const result = await this.pool.query(
        `SELECT pl.*, 
         COALESCE(l.title, pl.category_title) as lifestyle_title, 
         COALESCE(lo.title, pl.option_title) as option_title 
         FROM patient_lifestyle pl
         LEFT JOIN lifestyle l ON pl.lifestyle_id = l.id
         LEFT JOIN lifestyle_options lo ON pl.lifestyle_option_id = lo.id
         WHERE pl.patient_id = $1
         ORDER BY COALESCE(l.title, pl.category_title), COALESCE(lo.title, pl.option_title)`,
        [numericPatientId]
      );

      const groupedHistory = result.rows.reduce((acc, row) => {
        const category = row.lifestyle_title;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: row.id,
          option_id: row.lifestyle_option_id,
          option_title: row.option_title
        });
        return acc;
      }, {});

      return {
        data: groupedHistory,
        notes: result.rows.find(row => row.notes && row.notes.trim() !== '')?.notes || ''
      };
    } catch (error) {
      console.error('Error getting patient lifestyle:', error);
      throw new Error('Failed to fetch patient lifestyle');
    }
  }

  async deletePatientLifestyle(data: any, user: any) {
    try {
      const { patient_id, lifestyle_option_id } = data;
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      await this.pool.query(
        'DELETE FROM patient_lifestyle WHERE patient_id = $1 AND lifestyle_option_id = $2 AND location_id = $3',
        [patient_id, lifestyle_option_id, location_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete lifestyle');
    }
  }
}
