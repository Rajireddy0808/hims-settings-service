import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DietChartService {
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

  async savePatientDietCharts(data: any, user: any) {
    try {
      const { patient_id, diet_charts, notes } = data;
      
      const location_id = data.location_id || user?.primary_location_id || user?.location_id || user?.id;
      const created_by = user?.id || user?.user_id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      const results = [];
      for (const chart of diet_charts) {
        const result = await this.pool.query(
          `INSERT INTO patient_diet_charts 
           (patient_id, location_id, chart_no, chart_title, chart_title_specific, 
            start_date, end_date, notes, created_by) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING id`,
          [
            patient_id, location_id, chart.chartNo, chart.chartTitle,
            chart.chartTitleSpecific, chart.startDate || null, chart.endDate || null,
            notes, created_by
          ]
        );
        results.push(result.rows[0].id);
      }

      return { success: true, dietChartIds: results };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save diet charts');
    }
  }

  async getPatientDietCharts(patientId: string, user: any) {
    try {
      const numericPatientId = parseInt(patientId);
      const location_id = user?.primary_location_id || user?.location_id || 1;

      const result = await this.pool.query(
        `SELECT * FROM patient_diet_charts
         WHERE patient_id = $1 AND location_id = $2
         ORDER BY created_at DESC`,
        [numericPatientId, location_id]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting patient diet charts:', error);
      throw new Error('Failed to fetch patient diet charts');
    }
  }

  async deletePatientDietChart(id: number, user: any) {
    try {
      const location_id = user?.primary_location_id || user?.location_id || user?.id;

      if (!location_id) {
        throw new Error('Location ID not found in user context');
      }

      await this.pool.query(
        'DELETE FROM patient_diet_charts WHERE id = $1 AND location_id = $2',
        [id, location_id]
      );

      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Failed to delete diet chart');
    }
  }
}
