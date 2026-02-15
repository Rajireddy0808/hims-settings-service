import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class LifestyleService {
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
      const { patient_id, lifestyle_id, lifestyle_option_id, category_title, option_title } = data;
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Get numeric lifestyle_id from title string
      const lifestyleResult = await this.pool.query(
        'SELECT id FROM lifestyle WHERE title = $1',
        [lifestyle_id]
      );
      
      if (lifestyleResult.rows.length === 0) {
        throw new Error(`Lifestyle not found with title: ${lifestyle_id}`);
      }
      
      const numericLifestyleId = lifestyleResult.rows[0].id;

      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_lifestyle WHERE patient_id = $1 AND lifestyle_option_id = $2 AND location_id = $3',
        [patient_id, lifestyle_option_id, location_id]
      );
      
      if (existingRecord.rows.length > 0) {
        return { message: 'Record already exists' };
      }

      const result = await this.pool.query(
        'INSERT INTO patient_lifestyle (patient_id, lifestyle_id, lifestyle_option_id, category_title, option_title, location_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [patient_id, numericLifestyleId, lifestyle_option_id, category_title, option_title, location_id]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save lifestyle');
    }
  }

  async getPatientLifestyle(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const location_id = user?.primary_location_id || user?.location_id || 1;

      const result = await this.pool.query(
        `SELECT pl.*, l.title as lifestyle_title, lo.title as option_title 
         FROM patient_lifestyle pl
         JOIN lifestyle l ON pl.lifestyle_id = l.id
         JOIN lifestyle_options lo ON pl.lifestyle_option_id = lo.id
         WHERE pl.patient_id = $1 AND pl.location_id = $2
         ORDER BY l.title, lo.title`,
        [numericPatientId, location_id]
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

      return groupedHistory;
    } catch (error) {
      console.error('Error getting patient lifestyle:', error);
      throw new Error('Failed to fetch patient lifestyle');
    }
  }

  async deletePatientLifestyle(data: any, user: any) {
    try {
      const { patient_id, lifestyle_option_id } = data;
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

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
