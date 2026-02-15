import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UserAccess } from '../entities/user-access.entity';
import { Module } from '../entities/module.entity';
import { SubModule } from '../entities/sub-module.entity';
import { User } from '../entities/user.entity';
import { ModulesService } from './modules.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserAccess)
    private userAccessRepository: Repository<UserAccess>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(SubModule)
    private subModuleRepository: Repository<SubModule>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private modulesService: ModulesService,
  ) {}

  async findAll(locationId?: number, includeModules?: boolean): Promise<Role[]> {
    let roles: Role[];
    
    if (!locationId) {
      roles = await this.roleRepository.find({ 
        where: { isActive: 1 },
        order: { name: 'ASC' } 
      });
    } else {
      roles = await this.roleRepository.find({
        where: { locationId: locationId, isActive: 1 },
        order: { name: 'ASC' }
      });
    }

    // Add modules for each role
    for (const role of roles) {
      // Set user count to 0 since we can't query by roleId anymore
      (role as any).userCount = 0;
      
      if (includeModules) {
        // Add modules for each role (empty array if no user_access entries)
        const userAccess = await this.userAccessRepository.find({
          where: { roleId: role.id }
        });
        
        if (userAccess.length > 0) {
          const moduleIds = [...new Set(userAccess.map(ua => ua.moduleId))];
          const modules = await this.moduleRepository.find({
            where: moduleIds.map(id => ({ id })),
            select: ['name']
          });
          (role as any).modules = modules.map(m => m.name);
        } else {
          (role as any).modules = [];
        }
      }
    }

    return roles;
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    try {

      
      // Convert boolean to 0/1
      const createData = { ...roleData };
      if (typeof createData.isActive !== 'undefined') {
        createData.isActive = createData.isActive ? 1 : 0;
      }
      
      const role = this.roleRepository.create(createData);
      const savedRole = await this.roleRepository.save(role);

      return savedRole;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async update(id: number, roleData: Partial<Role>): Promise<Role> {

    
    // Convert boolean to 0/1
    const updateData = { ...roleData };
    if (typeof updateData.isActive !== 'undefined') {
      updateData.isActive = updateData.isActive ? 1 : 0;
    }
    
    const result = await this.roleRepository.update(id, updateData);

    return this.findOne(id);
  }

  async remove(id: number): Promise<Role> {
    const role = await this.findOne(id);
    await this.roleRepository.update(id, { isActive: 0 });
    return this.findOne(id);
  }

  async getRolePermissions(roleId: number, locationId?: number): Promise<any[]> {
    try {

      
      // Get modules with submodules using the modules service
      const modulesWithSubModules = await this.modulesService.findModulesWithSubModules();

      
      // Get user access permissions for this role
      const userAccess = await this.userAccessRepository.find({
        where: { roleId }
      });

      
      // Build the response structure with permissions
      const result = modulesWithSubModules.map(module => {
        const moduleSubModules = module.subModules.map(sm => ({
          id: sm.id,
          name: sm.name,
          path: sm.path,
          icon: sm.icon,
          moduleId: module.id,
          permissions: this.getPermissionForModule(userAccess, module.id, sm.id)
        }));
        
        return {
          id: module.id,
          name: module.name,
          path: module.path,
          icon: module.icon,
          order: module.order,
          isActive: module.isActive,
          permissions: this.getPermissionForModule(userAccess, module.id, null),
          subModules: moduleSubModules
        };
      });
      

      return result;
    } catch (error) {
      console.error('Error in getRolePermissions:', error);
      // Return empty array on error to prevent 500
      return [];
    }
  }
  
  private getPermissionForModule(userAccess: UserAccess[], moduleId: number, subModuleId: number | null) {
    const permission = userAccess.find(ua => 
      parseInt(ua.moduleId.toString()) === parseInt(moduleId.toString()) && 
      (subModuleId ? parseInt(ua.subModuleId?.toString() || '0') === parseInt(subModuleId.toString()) : ua.subModuleId === null)
    );
    
    return permission ? {
      add: permission.add === 1,
      edit: permission.edit === 1,
      delete: permission.delete === 1,
      view: permission.view === 1
    } : {
      add: false,
      edit: false,
      delete: false,
      view: false
    };
  }

  async updateRolePermissions(roleId: number, permissions: any[]): Promise<void> {
    try {


      
      // Delete existing permissions for this role
      await this.userAccessRepository.delete({ roleId });
      
      // Insert new permissions
      if (permissions.length > 0) {
        const userAccessEntries = permissions
          .filter(p => p.add || p.edit || p.delete || p.view) // Only save permissions that have at least one action enabled
          .map(permission => ({
            roleId,
            moduleId: permission.moduleId,
            subModuleId: permission.subModuleId || null,
            add: permission.add ? 1 : 0,
            edit: permission.edit ? 1 : 0,
            delete: permission.delete ? 1 : 0,
            view: permission.view ? 1 : 0
          }));
        

        
        if (userAccessEntries.length > 0) {
          await this.userAccessRepository.save(userAccessEntries);
        }
      }
      

    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }
}
