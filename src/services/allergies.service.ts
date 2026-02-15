import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AllergiesService {
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
      const { patient_id, allergies_id, allergies_option_id, category_title, option_title } = data;
      
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      // Get numeric allergies_id from title string
      const allergiesResult = await this.pool.query(
        'SELECT id FROM allergies WHERE title = $1',
        [allergies_id]
      );
      
      if (allergiesResult.rows.length === 0) {
        throw new Error(`Allergies not found with title: ${allergies_id}`);
      }
      
      const numericAllergiesId = allergiesResult.rows[0].id;

      const existingRecord = await this.pool.query(
        'SELECT id FROM patient_allergies WHERE patient_id = $1 AND allergies_option_id = $2 AND location_id = $3',
        [patient_id, allergies_option_id, location_id]
      );
      
      if (existingRecord.rows.length > 0) {
        return { message: 'Record already exists' };
      }

      const result = await this.pool.query(
        'INSERT INTO patient_allergies (patient_id, allergies_id, allergies_option_id, category_title, option_title, location_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [patient_id, numericAllergiesId, allergies_option_id, category_title, option_title, location_id]
      );

      return { success: true, id: result.rows[0].id };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save allergies');
    }
  }

  async getPatientAllergies(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const userId = user?.sub || user?.id || user?.userId;
      const location_id = user?.primary_location_id || user?.location_id || 1;

      const result = await this.pool.query(
        `SELECT pa.*, a.title as allergies_title, ao.title as option_title 
         FROM patient_allergies pa
         JOIN allergies a ON pa.allergies_id = a.id
         JOIN allergies_options ao ON pa.allergies_option_id = ao.id
         WHERE pa.patient_id = $1 AND pa.location_id = $2
         ORDER BY a.title, ao.title`,
        [numericPatientId, location_id]
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

      return groupedAllergies;
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
