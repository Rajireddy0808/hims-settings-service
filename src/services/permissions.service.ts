import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccess } from '../entities/user-access.entity';
import { ModulesService } from './modules.service';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(UserAccess)
    private userAccessRepository: Repository<UserAccess>,
    private modulesService: ModulesService,
  ) {}

  async getRolePermissions(roleId: number): Promise<UserAccess[]> {
    return this.userAccessRepository.find({ where: { roleId } });
  }

  async updateRolePermissions(roleId: number, permissions: Partial<UserAccess>[]): Promise<UserAccess[]> {
    // Delete existing permissions for role
    await this.userAccessRepository.delete({ roleId });

    // Create new permissions
    const newPermissions = permissions.map(permission => 
      this.userAccessRepository.create({ ...permission, roleId })
    );

    await this.userAccessRepository.save(newPermissions);
    return this.getRolePermissions(roleId);
  }

  async getModulePermissions(): Promise<any[]> {
    const query = `
      SELECT DISTINCT
        m.id as module_id,
        m.name as module_name,
        m.path as module_path,
        sm.id as sub_module_id,
        sm.subcat_name as sub_module_name,
        sm.subcat_path as sub_module_path
      FROM modules m
      LEFT JOIN sub_modules sm ON m.id = sm.module_id AND sm.is_active = true
      WHERE m.is_active = true
      ORDER BY m."order", sm.id
    `;
    
    return this.userAccessRepository.query(query);
  }

  async getRolePermissionsWithModules(roleId: number): Promise<any[]> {
    const query = `
      SELECT 
        m.id as module_id,
        m.name as module_name,
        m.path as module_path,
        sm.id as sub_module_id,
        sm.subcat_name as sub_module_name,
        sm.subcat_path as sub_module_path,
        COALESCE(ua.add, 0) as can_add,
        COALESCE(ua.edit, 0) as can_edit,
        COALESCE(ua.delete, 0) as can_delete,
        COALESCE(ua.view, 0) as can_view
      FROM modules m
      LEFT JOIN sub_modules sm ON m.id = sm.module_id AND sm.is_active = true
      LEFT JOIN user_access ua ON ua.module_id = m.id 
        AND (ua.sub_module_id = sm.id OR (ua.sub_module_id IS NULL AND sm.id IS NULL))
        AND ua.role_id = $1
      WHERE m.is_active = true
      ORDER BY m."order", sm.id
    `;
    
    return this.userAccessRepository.query(query, [roleId]);
  }

  async getModulesWithPermissions(roleId: number): Promise<any[]> {
    try {
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
          sm.icon as sub_module_icon,
          COALESCE(ua.add, 0) as can_add,
          COALESCE(ua.edit, 0) as can_edit,
          COALESCE(ua.delete, 0) as can_delete,
          COALESCE(ua.view, 0) as can_view
        FROM modules m
        LEFT JOIN sub_modules sm ON m.id = sm.module_id
        LEFT JOIN user_access ua ON ua.module_id = m.id 
          AND (ua.sub_module_id = sm.id OR (ua.sub_module_id IS NULL AND sm.id IS NULL))
          AND ua.role_id = $1
        WHERE m.status = 1
        ORDER BY m."order", sm.id
      `;
      
      const results = await this.userAccessRepository.query(query, [roleId]);
      
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
            moduleId: moduleId,
            permissions: {
              add: row.can_add || 0,
              edit: row.can_edit || 0,
              delete: row.can_delete || 0,
              view: row.can_view || 0
            }
          });
        } else {
          // Module without submodules
          modulesMap.get(moduleId).permissions = {
            add: row.can_add || 0,
            edit: row.can_edit || 0,
            delete: row.can_delete || 0,
            view: row.can_view || 0
          };
        }
      });
      
      return Array.from(modulesMap.values());
    } catch (error) {
      console.error('Error in getModulesWithPermissions:', error);
      throw error;
    }
  }
}
