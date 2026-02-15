import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../entities/module.entity';
import { SubModule } from '../entities/sub-module.entity';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(SubModule)
    private subModuleRepository: Repository<SubModule>,
  ) {}

  async findAllModules(): Promise<Module[]> {
    return this.moduleRepository.find({ 
      order: { order: 'ASC' } 
    });
  }

  async findAllSubModules(): Promise<SubModule[]> {
    return this.subModuleRepository.find({
      relations: ['module'],
      where: { isActive: true },
      order: { moduleId: 'ASC', id: 'ASC' }
    });
  }

  async findModulesWithSubModules(): Promise<any[]> {
    try {
      // Get modules with their submodules from database
      const query = `
        SELECT 
          m.id as module_id,
          m.name as module_name,
          m.path as module_path,
          m.icon as module_icon,
          m."order" as module_order,
          m.status as module_status,
          sm.id as sub_module_id,
          sm.subcat_name as sub_module_name,
          sm.subcat_path as sub_module_path,
          sm.icon as sub_module_icon
        FROM modules m
        LEFT JOIN sub_modules sm ON m.id = sm.module_id
        WHERE m.status = 1
        ORDER BY m."order", sm.id
      `;
      
      const results = await this.moduleRepository.query(query);
      
      if (results.length === 0) {

        return this.getDefaultModulesWithSubModules();
      }
      
      // Group results by module
      const modulesMap = new Map();
      
      results.forEach(row => {
        const moduleId = row.module_id;
        
        if (!modulesMap.has(moduleId)) {
          modulesMap.set(moduleId, {
            id: moduleId,
            name: row.module_name,
            path: row.module_path,
            icon: row.module_icon,
            order: row.module_order,
            isActive: row.module_status === 1,
            subModules: []
          });
        }
        
        if (row.sub_module_id) {
          modulesMap.get(moduleId).subModules.push({
            id: row.sub_module_id,
            name: row.sub_module_name,
            path: row.sub_module_path,
            icon: row.sub_module_icon,
            moduleId: moduleId
          });
        }
      });
      
      const modulesList = Array.from(modulesMap.values());

      return modulesList;
    } catch (error) {
      console.error('Error in findModulesWithSubModules:', error);
      return this.getDefaultModulesWithSubModules();
    }
  }

  private getDefaultModulesWithSubModules(): any[] {
    return [
      {
        id: 1,
        name: 'Front Office',
        path: '/front-office',
        icon: 'building',
        order: 1,
        isActive: true,
        subModules: [
          { id: 11, name: 'Patient Registration', path: '/front-office/registration', moduleId: 1 },
          { id: 12, name: 'Appointments', path: '/front-office/appointments', moduleId: 1 },
          { id: 13, name: 'Billing', path: '/front-office/billing', moduleId: 1 },
          { id: 14, name: 'Reports', path: '/front-office/reports', moduleId: 1 }
        ]
      },
      {
        id: 2,
        name: 'Doctors',
        path: '/doctors',
        icon: 'user-md',
        order: 2,
        isActive: true,
        subModules: [
          { id: 21, name: 'Patient Consultation', path: '/doctors/patient', moduleId: 2 },
          { id: 22, name: 'Templates', path: '/doctors/templates', moduleId: 2 },
          { id: 23, name: 'Reports', path: '/doctors/reports', moduleId: 2 }
        ]
      },
      {
        id: 3,
        name: 'Pharmacy',
        path: '/pharmacy',
        icon: 'pills',
        order: 3,
        isActive: true,
        subModules: [
          { id: 31, name: 'Dispensing', path: '/pharmacy/dispensing', moduleId: 3 },
          { id: 32, name: 'Inventory', path: '/pharmacy/inventory', moduleId: 3 },
          { id: 33, name: 'Sales', path: '/pharmacy/sales', moduleId: 3 },
          { id: 34, name: 'Reports', path: '/pharmacy/reports', moduleId: 3 }
        ]
      },
      {
        id: 4,
        name: 'Lab',
        path: '/lab',
        icon: 'flask',
        order: 4,
        isActive: true,
        subModules: [
          { id: 41, name: 'Test Orders', path: '/lab/orders', moduleId: 4 },
          { id: 42, name: 'Results', path: '/lab/results', moduleId: 4 },
          { id: 43, name: 'Test Master', path: '/lab/test-master', moduleId: 4 },
          { id: 44, name: 'Reports', path: '/lab/reports', moduleId: 4 }
        ]
      },
      {
        id: 5,
        name: 'Inpatient',
        path: '/inpatient',
        icon: 'bed',
        order: 5,
        isActive: true,
        subModules: [
          { id: 51, name: 'Admission', path: '/inpatient/admission', moduleId: 5 },
          { id: 52, name: 'Bed Management', path: '/inpatient/beds', moduleId: 5 },
          { id: 53, name: 'Patient Management', path: '/inpatient/manage-patients', moduleId: 5 },
          { id: 54, name: 'Transfers', path: '/inpatient/transfers', moduleId: 5 }
        ]
      },
      {
        id: 6,
        name: 'Settings',
        path: '/settings',
        icon: 'cog',
        order: 6,
        isActive: true,
        subModules: [
          { id: 61, name: 'User Management', path: '/settings/users', moduleId: 6 },
          { id: 62, name: 'Role Management', path: '/settings/roles', moduleId: 6 },
          { id: 63, name: 'Department Management', path: '/settings/departments', moduleId: 6 },
          { id: 64, name: 'Location Management', path: '/settings/locations', moduleId: 6 }
        ]
      }
    ];
  }

  async createModule(moduleData: Partial<Module>): Promise<Module> {
    const module = this.moduleRepository.create(moduleData);
    return this.moduleRepository.save(module);
  }

  async createSubModule(subModuleData: Partial<SubModule>): Promise<SubModule> {
    const subModule = this.subModuleRepository.create(subModuleData);
    return this.subModuleRepository.save(subModule);
  }

  async updateModule(id: number, moduleData: Partial<Module>): Promise<Module> {
    await this.moduleRepository.update(id, moduleData);
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  async deleteModule(id: number): Promise<void> {
    const result = await this.moduleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
  }
}
