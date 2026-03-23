import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class MedicineDaysService {
  constructor(private dataSource: DataSource) {}

  async createTablesIfNotExist() {
    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS medicine_days (
          id SERIAL PRIMARY KEY,
          days VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed if empty
      const countResult = await this.dataSource.query('SELECT COUNT(*) FROM medicine_days');
      const count = parseInt(countResult[0]?.count || '0');
      
      if (count === 0) {
        console.log('Seeding medicine_days table...');
        await this.dataSource.query(`
          INSERT INTO medicine_days (days) VALUES
          ('1'), ('3'), ('5'), ('7'), ('10'), ('13'), ('14'), ('15'), ('28'), ('30'), ('60'), ('90'), ('180'), ('360')
        `);
      }
    } catch (error) {
      console.error('Error creating/seeding medicine_days table:', error);
    }
  }

  async findAll(): Promise<any[]> {
    await this.createTablesIfNotExist();
    return this.dataSource.query('SELECT * FROM medicine_days ORDER BY id ASC');
  }

  async findOne(id: number): Promise<any> {
    const result = await this.dataSource.query('SELECT * FROM medicine_days WHERE id = $1', [id]);
    return result[0];
  }

  async create(data: { days: string }): Promise<any> {
    await this.createTablesIfNotExist();
    const result = await this.dataSource.query(
      'INSERT INTO medicine_days (days) VALUES ($1) RETURNING *',
      [data.days]
    );
    return result[0];
  }

  async update(id: number, data: { days: string }): Promise<any> {
    const result = await this.dataSource.query(
      'UPDATE medicine_days SET days = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [data.days, id]
    );
    return result[0];
  }

  async remove(id: number): Promise<any> {
    return this.dataSource.query('DELETE FROM medicine_days WHERE id = $1', [id]);
  }
}
