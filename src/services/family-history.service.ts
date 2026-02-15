import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class FamilyHistoryService {
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

  async getFamilyHistory() {
    try {
      const result = await this.pool.query('SELECT * FROM family_history ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch family history');
    }
  }

  async getFamilyHistoryOptions(familyHistoryId: number) {
    try {
      const result = await this.pool.query(
        'SELECT * FROM family_history_options WHERE family_history_id = $1 ORDER BY id',
        [familyHistoryId]
      );
      return result.rows;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch family history options');
    }
  }

  async savePatientFamilyHistory(data: any, user: any) {
    try {
      const { patient_id, family_history_id, family_history_option_id, category_title, option_title } = data;
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Get numeric family_history_id from title string
      const familyHistoryResult = await this.pool.query(
        'SELECT id FROM family_history WHERE title = $1',
        [family_history_id]
      );
      
      if (familyHistoryResult.rows.length === 0) {
        throw new Error(`Family history not found with title: ${family_history_id}`);
      }
      
      const numericFamilyHistoryId = familyHistoryResult.rows[0].id;

      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_family_history WHERE patient_id = $1 AND family_history_option_id = $2 AND location_id = $3',
        [patient_id, family_history_option_id, location_id]
      );
      
      if (existingRecord.rows.length > 0) {
        return { message: 'Record already exists' };
      }

      const result = await this.pool.query(
        'INSERT INTO patient_family_history (patient_id, family_history_id, family_history_option_id, category_title, option_title, location_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [patient_id, numericFamilyHistoryId, family_history_option_id, category_title, option_title, location_id]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save family history');
    }
  }

  async getPatientFamilyHistory(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const location_id = user?.primary_location_id || user?.location_id || 1;

      const result = await this.pool.query(
        `SELECT pfh.*, fh.title as family_history_title, fho.title as option_title 
         FROM patient_family_history pfh
         JOIN family_history fh ON pfh.family_history_id = fh.id
         JOIN family_history_options fho ON pfh.family_history_option_id = fho.id
         WHERE pfh.patient_id = $1 AND pfh.location_id = $2
         ORDER BY fh.title, fho.title`,
        [numericPatientId, location_id]
      );

      const groupedHistory = result.rows.reduce((acc, row) => {
        const category = row.family_history_title;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: row.id,
          option_id: row.family_history_option_id,
          option_title: row.option_title
        });
        return acc;
      }, {});

      return groupedHistory;
    } catch (error) {
      console.error('Error getting patient family history:', error);
      throw new Error('Failed to fetch patient family history');
    }
  }

  async deletePatientFamilyHistory(data: any, user: any) {
    try {
      const { patient_id, family_history_option_id } = data;
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      await this.pool.query(
        'DELETE FROM patient_family_history WHERE patient_id = $1 AND family_history_option_id = $2 AND location_id = $3',
        [patient_id, family_history_option_id, location_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete family history');
    }
  }
}
