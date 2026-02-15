import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';

@Injectable()
export class LocationsIpService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>
  ) {}

  async findAll() {
    await this.locationRepository.query(`
      CREATE TABLE IF NOT EXISTS "locationsIp" (
        id SERIAL PRIMARY KEY,
        ip VARCHAR(45) NOT NULL,
        location_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    return this.locationRepository.query(
      `SELECT li.*, l.name as location_name 
       FROM "locationsIp" li 
       LEFT JOIN locations l ON l.id = li.location_id 
       ORDER BY li.created_at DESC`
    );
  }

  async create(data: any) {
    const result = await this.locationRepository.query(
      'INSERT INTO "locationsIp" (ip, location_id, status, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [data.ip, data.locationId, data.status || 'active']
    );
    return result[0];
  }

  async update(id: number, data: any) {
    const result = await this.locationRepository.query(
      'UPDATE "locationsIp" SET ip = $1, location_id = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [data.ip, data.locationId, data.status, id]
    );
    return result[0];
  }

  async remove(id: number) {
    await this.locationRepository.query('DELETE FROM "locationsIp" WHERE id = $1', [id]);
    return { success: true };
  }
}
