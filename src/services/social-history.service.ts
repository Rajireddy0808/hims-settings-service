import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class SocialHistoryService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: '12345',
      database: 'postgres',
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
      const { patient_id, social_history_id, social_history_option_id, category_title, option_title } = data;
      
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Get numeric social_history_id from title string
      const socialHistoryResult = await this.pool.query(
        'SELECT id FROM social_history WHERE title = $1',
        [social_history_id]
      );
      
      if (socialHistoryResult.rows.length === 0) {
        throw new Error(`Social history not found with title: ${social_history_id}`);
      }
      
      const numericSocialHistoryId = socialHistoryResult.rows[0].id;

      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_social_history WHERE patient_id = $1 AND social_history_option_id = $2 AND location_id = $3',
        [patient_id, social_history_option_id, location_id]
      );
      
      if (existingRecord.rows.length > 0) {
        return { message: 'Record already exists' };
      }

      const result = await this.pool.query(
        'INSERT INTO patient_social_history (patient_id, social_history_id, social_history_option_id, category_title, option_title, location_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [patient_id, numericSocialHistoryId, social_history_option_id, category_title, option_title, location_id]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save social history');
    }
  }

  async getPatientSocialHistory(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const location_id = user?.primary_location_id || user?.location_id || 1;

      const result = await this.pool.query(
        `SELECT psh.*, sh.title as social_history_title, sho.title as option_title 
         FROM patient_social_history psh
         JOIN social_history sh ON psh.social_history_id = sh.id
         JOIN social_history_options sho ON psh.social_history_option_id = sho.id
         WHERE psh.patient_id = $1 AND psh.location_id = $2
         ORDER BY sh.title, sho.title`,
        [numericPatientId, location_id]
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

      return groupedHistory;
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
