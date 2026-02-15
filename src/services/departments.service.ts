import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    const departments = await this.departmentRepository.find({ 
      where: { isActive: true },
      order: { name: 'ASC' } 
    });
    return departments.map(dept => ({
      ...dept,
      staffCount: 0 // Default staff count for general findAll
    }));
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return department;
  }

  async create(departmentData: Partial<Department>): Promise<Department> {
    // Check for duplicate name in the same location only
    const existingDept = await this.departmentRepository.findOne({
      where: {
        name: departmentData.name,
        locationId: departmentData.locationId,
        isActive: true
      }
    });
    
    if (existingDept) {
      throw new BadRequestException('Department name already exists in this location');
    }

    const department = this.departmentRepository.create(departmentData);
    return await this.departmentRepository.save(department);
  }

  async update(id: number, departmentData: Partial<Department>): Promise<Department> {
    if (departmentData.name) {
      const currentDept = await this.findOne(id);
      // Check for duplicate name in the same location (excluding current department)
      const existingDept = await this.departmentRepository.findOne({
        where: {
          name: departmentData.name,
          locationId: currentDept.locationId,
          isActive: true
        }
      });
      
      if (existingDept && existingDept.id !== id) {
        throw new BadRequestException('Department name already exists in this location');
      }
    }

    await this.departmentRepository.update(id, departmentData);
    return this.findOne(id);
  }

  async findByLocationId(locationId: number): Promise<Department[]> {
    try {

      
      // First, get basic departments for the location
      const departments = await this.departmentRepository.find({
        where: { 
          locationId: locationId,
          isActive: true 
        },
        order: { name: 'ASC' }
      });
      

      
      // Debug: Check table structures
      const ulpData = await this.departmentRepository.query(
        'SELECT * FROM user_location_permissions WHERE location_id = $1',
        [locationId]
      );

      
      const userData = await this.departmentRepository.query(
        'SELECT id, first_name, last_name, is_active FROM users WHERE is_active = true'
      );

      
      // Add staff count for each department from user_location_permissions table
      const result = await Promise.all(
        departments.map(async (dept) => {
          try {
            const staffCountResult = await this.departmentRepository.query(
              'SELECT COUNT(DISTINCT ulp.user_id) as count FROM user_location_permissions ulp INNER JOIN users u ON u.id = ulp.user_id WHERE ulp.department_id = $1 AND ulp.location_id = $2 AND u.is_active = true',
              [dept.id, locationId]
            );
            const staffCount = parseInt(staffCountResult[0]?.count || '0');

            
            return {
              ...dept,
              staffCount
            };
          } catch (error) {
            console.error('Error getting staff count for dept', dept.id, error);
            return {
              ...dept,
              staffCount: 0
            };
          }
        })
      );
      
      return result;
    } catch (error) {
      console.error('Departments Service error:', error);
      throw error;
    }
  }

  async remove(id: number): Promise<Department> {
    const department = await this.findOne(id);
    await this.departmentRepository.update(id, { isActive: false });
    return this.findOne(id);
  }
}
