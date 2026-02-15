import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Location } from '../entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async findAll(): Promise<Location[]> {
    const locations = await this.locationRepository.find({ 
      where: { isActive: true },
      order: { name: 'ASC' } 
    });
    return locations;
  }

    async All(): Promise<Location[]> {
    const locations = await this.locationRepository.find({ 
      // where: { isActive: true },
      order: { name: 'ASC' } 
    });
    return locations;
  }

  async getUserAccessibleLocations(userLocationId?: string): Promise<Location[]> {
    // If no location_id or empty string (admin/superadmin), return all locations
    if (!userLocationId || userLocationId === '' || userLocationId === '""') {
      return this.findAll();
    }

    // Parse location IDs (handle "1" or "1,2" format)
    const locationIds = userLocationId.replace(/"/g, '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (locationIds.length === 0) {
      return this.findAll();
    }

    // Filter locations based on user's accessible location IDs (only active ones)
    const locations = await this.locationRepository.find({
      where: { 
        id: In(locationIds),
        isActive: true 
      },
      order: { name: 'ASC' }
    });
    
    return locations;
  }

  async findOne(id: number): Promise<Location> {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return location;
  }

  async create(locationData: Partial<Location>): Promise<Location> {
    const location = this.locationRepository.create(locationData);
    return this.locationRepository.save(location);
  }

  async update(id: number, locationData: Partial<Location>): Promise<Location> {
    try {
      const result = await this.locationRepository.update(id, locationData);
      if (result.affected === 0) {
        throw new NotFoundException(`Location with ID ${id} not found`);
      }
      return this.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<Location> {
    const location = await this.findOne(id);
    await this.locationRepository.update(id, { isActive: false });
    return this.findOne(id);
  }
}
