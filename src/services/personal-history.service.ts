import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PersonalHistoryService {
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

  async getPersonalHistory() {
    try {
      const result = await this.pool.query('SELECT * FROM personal_history ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch personal history');
    }
  }

  async getPersonalHistoryOptions(historyId: number) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM personal_history_options WHERE personal_history_id = $1 ORDER BY id',
        [historyId]
      );
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch personal history options');
    }
  }

  async savePatientPersonalHistory(data: any, user: any) {
    try {
      const { patient_id, personal_history_id, personal_history_option_id, category_title, option_title } = data;
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Get numeric personal_history_id from title string
      const personalHistoryResult = await this.pool.query(
        'SELECT id FROM personal_history WHERE title = $1',
        [personal_history_id]
      );
      
      if (personalHistoryResult.rows.length === 0) {
        throw new Error(`Personal history not found with title: ${personal_history_id}`);
      }
      
      const numericPersonalHistoryId = personalHistoryResult.rows[0].id;

      // Check if record already exists
      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_personal_history WHERE patient_id = $1 AND personal_history_option_id = $2 AND location_id = $3',
        [patient_id, personal_history_option_id, location_id]
      );
      
      if (existingRecord.rows.length > 0) {
        return { message: 'Record already exists' };
      }

      // Insert new record with location_id
      const result = await this.pool.query(
        'INSERT INTO patient_personal_history (patient_id, personal_history_id, personal_history_option_id, category_title, option_title, location_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [patient_id, numericPersonalHistoryId, personal_history_option_id, category_title, option_title, location_id]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save personal history');
    }
  }

  async getPatientPersonalHistory(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const location_id = user?.primary_location_id || user?.location_id || 1;

      const result = await this.pool.query(
        `SELECT pph.*, ph.title as personal_history_title, pho.title as option_title 
         FROM patient_personal_history pph
         JOIN personal_history ph ON pph.personal_history_id = ph.id
         JOIN personal_history_options pho ON pph.personal_history_option_id = pho.id
         WHERE pph.patient_id = $1 AND pph.location_id = $2
         ORDER BY ph.title, pho.title`,
        [numericPatientId, location_id]
      );

      const groupedHistory = result.rows.reduce((acc, row) => {
        const category = row.personal_history_title;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: row.id,
          option_id: row.personal_history_option_id,
          option_title: row.option_title
        });
        return acc;
      }, {});

      return groupedHistory;
    } catch (error) {
      console.error('Error getting patient personal history:', error);
      throw new Error('Failed to fetch patient personal history');
    }
  }

  async deletePatientPersonalHistory(data: any, user: any) {
    try {
      const { patient_id, personal_history_option_id } = data;
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      await this.pool.query(
        'DELETE FROM patient_personal_history WHERE patient_id = $1 AND personal_history_option_id = $2 AND location_id = $3',
        [patient_id, personal_history_option_id, location_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete personal history');
    }
  }
}
