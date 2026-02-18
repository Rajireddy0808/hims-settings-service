import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DrugHistoryService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: 'crossover.proxy.rlwy.net',
      port: 37250,
      user: 'postgres',
      password: 'xHlKZdwqKVpjVGLfvrgPmUyTvMaqVTQO',
      database: 'railway',
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
      const { patient_id, drug_history_id, drug_history_option_id, category_title, option_title } = data;



      // Get location_id from user object or use selected_location_id from frontend
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
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
        return { message: 'Record already exists' };
      }

      // Insert new record with location_id
      const result = await this.pool.query(
        'INSERT INTO patient_drug_history (patient_id, drug_history_id, drug_history_option_id, category_title, option_title, location_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [patient_id, numericDrugHistoryId, drug_history_option_id, category_title, option_title, location_id]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save drug history');
    }
  }

  async getPatientDrugHistory(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const location_id = user?.primary_location_id || user?.location_id || 1;

      const result = await this.pool.query(
        `SELECT pdh.*, 
         COALESCE(dh.title, pdh.category_title) as drug_history_title, 
         COALESCE(dho.title, pdh.option_title) as option_title 
         FROM patient_drug_history pdh
         LEFT JOIN drug_history dh ON pdh.drug_history_id = dh.id
         LEFT JOIN drug_history_options dho ON pdh.drug_history_option_id = dho.id
         WHERE pdh.patient_id = $1 AND pdh.location_id = $2
         ORDER BY COALESCE(dh.title, pdh.category_title), COALESCE(dho.title, pdh.option_title)`,
        [numericPatientId, location_id]
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

      return groupedHistory;
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
