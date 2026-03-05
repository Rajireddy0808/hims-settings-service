import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class SocialHistoryService {
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

  async getSocialHistory() {
    try {
      const result = await this.pool.query('SELECT * FROM social_history ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch social history');
    }
  }

  async getSocialHistoryOptions(socialHistoryId: number) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM social_history_options WHERE social_history_id = $1 ORDER BY id',
        [socialHistoryId]
      );
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch social history options');
    }
  }

  async savePatientSocialHistory(data: any, user: any) {
    try {
      const { patient_id, social_history_id, social_history_option_id, category_title, option_title, notes } = data;

      // Add notes column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_social_history 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);

      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Handle only notes update if social_history_option_id is not provided
      if (!social_history_option_id && notes !== undefined) {
        // Update notes for all rows of this patient
        const updateResult = await this.pool.query(
          'UPDATE patient_social_history SET notes = $1 WHERE patient_id = $2 AND location_id = $3',
          [notes, patient_id, location_id]
        );

        if (updateResult.rowCount === 0) {
          // If no rows exist, insert a placeholder with notes
          await this.pool.query(
            'INSERT INTO patient_social_history (patient_id, social_history_id, social_history_option_id, category_title, option_title, location_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [patient_id, 1, 0, 'General', 'Notes Placeholder', location_id, notes]
          );
        }
        return { success: true, message: 'Notes updated' };
      }

      // Get numeric social_history_id from title string
      let numericSocialHistoryId = social_history_id;

      if (typeof social_history_id === 'string' && isNaN(Number(social_history_id))) {
        const socialHistoryResult = await this.pool.query(
          'SELECT id FROM social_history WHERE title ILIKE $1',
          [social_history_id]
        );

        if (socialHistoryResult.rows.length > 0) {
          numericSocialHistoryId = socialHistoryResult.rows[0].id;
        } else {
          numericSocialHistoryId = 1;
        }
      }

      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_social_history WHERE patient_id = $1 AND social_history_option_id = $2 AND location_id = $3',
        [patient_id, social_history_option_id, location_id]
      );

      if (existingRecord.rows.length > 0) {
        // Update notes even if record exists
        if (notes !== undefined) {
          await this.pool.query(
            'UPDATE patient_social_history SET notes = $1 WHERE patient_id = $2 AND location_id = $3',
            [notes, patient_id, location_id]
          );
        }
        return { message: 'Record already exists' };
      }

      // Propagate existing notes if not provided in request
      let finalNotes = notes;
      if (finalNotes === undefined || finalNotes === null || finalNotes === '') {
        const existingNoteResult = await this.pool.query(
          'SELECT notes FROM patient_social_history WHERE patient_id = $1 AND notes IS NOT NULL AND notes != \'\' LIMIT 1',
          [patient_id]
        );
        if (existingNoteResult.rows.length > 0) {
          finalNotes = existingNoteResult.rows[0].notes;
        }
      }

      const result = await this.pool.query(
        'INSERT INTO patient_social_history (patient_id, social_history_id, social_history_option_id, category_title, option_title, location_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [patient_id, numericSocialHistoryId, social_history_option_id, category_title, option_title, location_id, finalNotes]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save social history');
    }
  }

  async getPatientSocialHistory(patientId: string, locationId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const locationIdRaw = locationId || user?.primary_location_id || user?.location_id || 1;
      const location_id = typeof locationIdRaw === 'string' ? parseInt(locationIdRaw.split(',')[0]) : locationIdRaw;

      // Add notes column if it doesn't exist
      await this.pool.query(`
        ALTER TABLE patient_social_history 
        ADD COLUMN IF NOT EXISTS notes TEXT
      `);

      const result = await this.pool.query(
        `SELECT psh.*, 
         COALESCE(sh.title, psh.category_title) as social_history_title, 
         COALESCE(sho.title, psh.option_title) as option_title 
         FROM patient_social_history psh
         LEFT JOIN social_history sh ON psh.social_history_id = sh.id
         LEFT JOIN social_history_options sho ON psh.social_history_option_id = sho.id
         WHERE psh.patient_id = $1
         ORDER BY COALESCE(sh.title, psh.category_title), COALESCE(sho.title, psh.option_title)`,
        [numericPatientId]
      );

      const groupedHistory = result.rows.reduce((acc, row) => {
        const category = row.social_history_title;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: row.id,
          option_id: row.social_history_option_id,
          option_title: row.option_title
        });
        return acc;
      }, {});

      return {
        data: groupedHistory,
        notes: result.rows.find(row => row.notes && row.notes.trim() !== '')?.notes || ''
      };
    } catch (error) {
      console.error('Error getting patient social history:', error);
      throw new Error('Failed to fetch patient social history');
    }
  }

  async deletePatientSocialHistory(data: any, user: any) {
    try {
      const { patient_id, social_history_option_id } = data;

      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      await this.pool.query(
        'DELETE FROM patient_social_history WHERE patient_id = $1 AND social_history_option_id = $2 AND location_id = $3',
        [patient_id, social_history_option_id, location_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete social history');
    }
  }
}
