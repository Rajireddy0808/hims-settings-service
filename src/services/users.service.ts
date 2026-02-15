import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserInfo } from '../entities/user-info.entity';
import { UserLocationPermission } from '../entities/user-location-permission.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserInfo)
    private userInfoRepository: Repository<UserInfo>,
    @InjectRepository(UserLocationPermission)
    private userLocationPermissionRepository: Repository<UserLocationPermission>,
  ) {}

  async findAll(locationId?: number, page: number = 1, limit: number = 10, departmentId?: number, search?: string): Promise<{ users: User[], total: number, totalPages: number }> {
    try {
      if (!locationId) {
        return {
          users: [],
          total: 0,
          totalPages: 0
        };
      }
      
      const offset = (page - 1) * limit;
      const locationIdStr = locationId.toString();
      
      let whereConditions = `ulp.location_id = $1`;
      let queryParams: any[] = [locationId];
      
      if (departmentId) {
        whereConditions += ` AND ulp.department_id = $${queryParams.length + 1}`;
        queryParams.push(departmentId);
      }
      
      if (search) {
        const searchPattern = `%${search.trim()}%`;
        whereConditions += ` AND (
          u.first_name ILIKE $${queryParams.length + 1} OR 
          u.last_name ILIKE $${queryParams.length + 2} OR 
          u.email ILIKE $${queryParams.length + 3} OR 
          u.username ILIKE $${queryParams.length + 4} OR
          CONCAT(u.first_name, ' ', u.last_name) ILIKE $${queryParams.length + 5}
        )`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }
      
      const countQuery = `
        SELECT COUNT(DISTINCT u.id) as total
        FROM users u
        INNER JOIN user_location_permissions ulp ON u.id = ulp.user_id AND ulp.is_active = true
        WHERE ${whereConditions}
      `;
      
      const query = `
        SELECT DISTINCT u.id, u.username, u.first_name as "firstName", u.last_name as "lastName", 
               u.email, u.phone, u.is_active as "isActive", u.primary_location_id as "primaryLocationId",
               u.created_at as "createdAt", u.updated_at as "updatedAt",
               ui.user_type as "userType",
               ulp.role_id as "roleId", ulp.department_id as "departmentId",
               r.name as "role_name", d.name as "departmentName"
        FROM users u
        LEFT JOIN user_info ui ON u.id = ui.user_id
        INNER JOIN user_location_permissions ulp ON u.id = ulp.user_id AND ulp.is_active = true
        LEFT JOIN roles r ON ulp.role_id = r.id
        LEFT JOIN departments d ON ulp.department_id = d.id
        WHERE ${whereConditions}
        ORDER BY u.created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;
      
      const [countResult, rawUsers] = await Promise.all([
        this.userRepository.query(countQuery, queryParams),
        this.userRepository.query(query, [...queryParams, limit, offset])
      ]);
      
      const total = parseInt(countResult[0].total);
      const totalPages = Math.ceil(total / limit);
      
      // Get location names and all location IDs for each user
      const usersWithLocationNames = await Promise.all(
        rawUsers.map(async (user) => {
          // Get all locations for this user
          const locationQuery = `
            SELECT ulp.location_id, l.name 
            FROM user_location_permissions ulp
            JOIN locations l ON ulp.location_id = l.id
            WHERE ulp.user_id = $1 AND ulp.is_active = true
          `;
          const locations = await this.userRepository.query(locationQuery, [user.id]);
          const locationNames = locations.map(loc => loc.name).join(', ');
          const locationIds = locations.map(loc => loc.location_id).join(',');
          
          return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            roleId: user.roleId,
            departmentId: user.departmentId,
            locationId: locationIds,
            primaryLocationId: user.primaryLocationId,
            departmentName: user.departmentName,
            locationNames: locationNames,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roleName: user.role_name,
            userType: user.userType
          };
        })
      );
      
      return {
        users: usersWithLocationNames,
        total,
        totalPages
      };
    } catch (error) {
      console.error('Error in findAll users:', error);
      const users = await this.userRepository.find({
        order: { createdAt: 'DESC' },
      });
      return {
        users,
        total: users.length,
        totalPages: Math.ceil(users.length / limit)
      };
    }
  }

  async findOne(id: number): Promise<any> {
    const query = `
      SELECT u.*, ui.user_type, ui.alternate_phone, ui.address, ui.pincode,
             ui.qualification, ui.years_of_experience, ui.medical_registration_number,
             ui.registration_council, ui.registration_valid_until, ui.license_copy,
             ui.degree_certificates, ui.employment_type, ui.joining_date
      FROM users u
      LEFT JOIN user_info ui ON u.id = ui.user_id
      WHERE u.id = $1
    `;
    
    const result = await this.userRepository.query(query, [id]);
    if (!result || result.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const user = result[0];
    
    // Get user location permissions
    const locationPermissions = await this.userLocationPermissionRepository.find({
      where: { userId: id, isActive: true }
    });
    
    // Format location IDs for backward compatibility
    const locationIds = locationPermissions.map(lp => lp.locationId).join(',');
    
    return {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      locationId: locationIds,
      primaryLocationId: user.primary_location_id,
      userInfoId: user.user_info_id,
      isActive: user.is_active,
      userType: user.user_type,
      alternatePhone: user.alternate_phone,
      address: user.address,
      pincode: user.pincode,
      qualification: user.qualification,
      yearsOfExperience: user.years_of_experience,
      medicalRegistrationNumber: user.medical_registration_number,
      registrationCouncil: user.registration_council,
      registrationValidUntil: user.registration_valid_until ? `${user.registration_valid_until.getFullYear()}-${String(user.registration_valid_until.getMonth() + 1).padStart(2, '0')}-${String(user.registration_valid_until.getDate()).padStart(2, '0')}` : null,
      licenseCopy: user.license_copy,
      degreeCertificates: user.degree_certificates,
      employmentType: user.employment_type,
      joiningDate: user.joining_date ? `${user.joining_date.getFullYear()}-${String(user.joining_date.getMonth() + 1).padStart(2, '0')}-${String(user.joining_date.getDate()).padStart(2, '0')}` : null,
      workingDays: user.working_days,
      workingHours: user.working_hours,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      userLocationAssignments: locationPermissions
    };
  }

  async create(userData: any): Promise<User> {

    // Check for existing username
    const existingUsername = await this.userRepository.findOne({
      where: { username: userData.username },
    });


    if (existingUsername) {

      throw new ConflictException('Username already exists');
    }

    // Check for existing email only if email is provided and not empty
    if (userData.email && userData.email.trim() !== '') {
      const existingEmail = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email || null,
      phone: userData.phone,
      password: hashedPassword,
      isActive: userData.isActive,
      primaryLocationId: userData.userLocationAssignments?.[0]?.locationId || null,
      employeeId: userData.username,
      workingDays: userData.workingDays || null,
      workingHours: userData.workingHours || null,
      userInfoId: null,
    });

    const savedUser = await this.userRepository.save(user);

    // Create user_info record after user is created
    const userInfo = this.userInfoRepository.create({
      userId: savedUser.id,
      userType: userData.userType || 'staff',
      alternatePhone: userData.alternatePhone,
      address: userData.address,
      pincode: userData.pincode,
      qualification: userData.qualification,
      yearsOfExperience: userData.yearsOfExperience,
      medicalRegistrationNumber: userData.medicalRegistrationNumber,
      registrationCouncil: userData.registrationCouncil,
      registrationValidUntil: userData.registrationValidUntil,
      licenseCopy: userData.licenseCopy,
      degreeCertificates: userData.degreeCertificates,
      employmentType: userData.employmentType,
      joiningDate: userData.joiningDate,
    });
    
    await this.userInfoRepository.save(userInfo);
    
    // Update user with userInfoId reference
    await this.userRepository.update(savedUser.id, { userInfoId: savedUser.id });

    // Save user location permissions
    if (userData.userLocationAssignments && userData.userLocationAssignments.length > 0) {
      const locationPermissions = userData.userLocationAssignments.map(assignment => 
        this.userLocationPermissionRepository.create({
          userId: savedUser.id,
          locationId: assignment.locationId,
          roleId: assignment.roleId,
          departmentId: assignment.departmentId,
          isActive: true
        })
      );
      await this.userLocationPermissionRepository.save(locationPermissions);
    }

    return savedUser;
  }

  async update(id: number, userData: any): Promise<any> {
    try {

      // Check if user exists
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      
      // Check for username uniqueness if username is being updated
      if (userData.username && userData.username !== existingUser.username) {
        const existingUsername = await this.userRepository.findOne({
          where: { username: userData.username },
        });
        if (existingUsername && existingUsername.id !== id) {
          throw new ConflictException('Username already exists');
        }
      }

      // Check for email uniqueness if email is being updated
      if (userData.email !== undefined && userData.email !== existingUser.email && userData.email.trim() !== '') {
        const existingEmail = await this.userRepository.findOne({
          where: { email: userData.email },
        });
        if (existingEmail && existingEmail.id !== id) {
          throw new ConflictException('Email already exists');
        }
      }

      // Update users table
      const updateData: any = {};
      if (userData.username) {
        updateData.username = userData.username;
        updateData.employeeId = userData.username;
      }
      if (userData.firstName) updateData.firstName = userData.firstName;
      if (userData.lastName) updateData.lastName = userData.lastName;
      if (userData.email !== undefined) updateData.email = userData.email || null;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.isActive !== undefined) updateData.isActive = userData.isActive;
      if (userData.userLocationAssignments?.[0]?.locationId) updateData.primaryLocationId = userData.userLocationAssignments[0].locationId;
      if (userData.workingDays !== undefined) updateData.workingDays = userData.workingDays;
      if (userData.workingHours !== undefined) updateData.workingHours = userData.workingHours;
      
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
      }

      if (Object.keys(updateData).length > 0) {

        await this.userRepository.update(id, updateData);

      }
      
      // Update or create user_info record
      if (existingUser.userInfoId) {
        const userInfoUpdateData: any = {};
        if (userData.userType !== undefined) userInfoUpdateData.userType = userData.userType;
        if (userData.alternatePhone !== undefined) userInfoUpdateData.alternatePhone = userData.alternatePhone;
        if (userData.address !== undefined) userInfoUpdateData.address = userData.address;
        if (userData.pincode !== undefined) userInfoUpdateData.pincode = userData.pincode;
        if (userData.qualification !== undefined) userInfoUpdateData.qualification = userData.qualification;
        if (userData.yearsOfExperience !== undefined) userInfoUpdateData.yearsOfExperience = userData.yearsOfExperience;
        if (userData.medicalRegistrationNumber !== undefined) userInfoUpdateData.medicalRegistrationNumber = userData.medicalRegistrationNumber;
        if (userData.registrationCouncil !== undefined) userInfoUpdateData.registrationCouncil = userData.registrationCouncil;
        if (userData.registrationValidUntil !== undefined) userInfoUpdateData.registrationValidUntil = userData.registrationValidUntil;
        if (userData.licenseCopy !== undefined) userInfoUpdateData.licenseCopy = userData.licenseCopy;
        if (userData.degreeCertificates !== undefined) userInfoUpdateData.degreeCertificates = userData.degreeCertificates;
        if (userData.employmentType !== undefined) userInfoUpdateData.employmentType = userData.employmentType;
        if (userData.joiningDate !== undefined) userInfoUpdateData.joiningDate = userData.joiningDate;
        
        if (Object.keys(userInfoUpdateData).length > 0) {
          await this.userInfoRepository.update(existingUser.userInfoId, userInfoUpdateData);
        }
      } else {
        // Create new user_info record if it doesn't exist
        const userInfo = this.userInfoRepository.create({
          userId: id,
          userType: userData.userType || 'staff',
          alternatePhone: userData.alternatePhone,
          address: userData.address,
          pincode: userData.pincode,
          qualification: userData.qualification,
          yearsOfExperience: userData.yearsOfExperience,
          medicalRegistrationNumber: userData.medicalRegistrationNumber,
          registrationCouncil: userData.registrationCouncil,
          registrationValidUntil: userData.registrationValidUntil,
          licenseCopy: userData.licenseCopy,
          degreeCertificates: userData.degreeCertificates,
          employmentType: userData.employmentType,
          joiningDate: userData.joiningDate,
        });
        
        await this.userInfoRepository.save(userInfo);
        await this.userRepository.update(id, { userInfoId: id });
      }
      
      // Update user location permissions
      if (userData.userLocationAssignments) {
        // Delete existing permissions
        await this.userLocationPermissionRepository.delete({ userId: id });
        
        // Create new permissions
        if (userData.userLocationAssignments.length > 0) {
          const locationPermissions = userData.userLocationAssignments.map(assignment => 
            this.userLocationPermissionRepository.create({
              userId: id,
              locationId: assignment.locationId,
              roleId: assignment.roleId,
              departmentId: assignment.departmentId,
              isActive: true
            })
          );
          await this.userLocationPermissionRepository.save(locationPermissions);
        }
      }
      
      // Return updated user
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      console.error('Error updating user:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async getUserDepartment(userId: number, locationId: number): Promise<{ departmentName: string }> {
    try {
      const query = `
        SELECT d.name as department_name
        FROM user_location_permissions ulp
        JOIN departments d ON ulp.department_id = d.id
        WHERE ulp.user_id = $1 AND ulp.location_id = $2 AND ulp.is_active = true
        LIMIT 1
      `;
      
      const result = await this.userRepository.query(query, [userId, locationId]);
      
      if (result && result.length > 0) {
        return { departmentName: result[0].department_name };
      }
      
      return { departmentName: 'General' };
    } catch (error) {
      console.error('Error fetching user department:', error);
      return { departmentName: 'General' };
    }
  }

  async toggleStatus(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.userRepository.update(id, { isActive: !user.isActive });
    return await this.userRepository.findOne({ where: { id } });
  }

  // Mobile App specific methods
  async getMobileNumbersForUser(userId: number): Promise<any[]> {
    try {
      const query = `
        SELECT mn.id, mn.mobile, mn.user_id, mn.caller_by, mn.disposition,
               mn.created_at, mn.updated_at, mn.location_id, mn.next_call_date,
               mn.patient_feeling, mn.notes
        FROM mobile_numbers mn
        WHERE mn.user_id = $1 AND mn.is_active = true
        ORDER BY mn.created_at DESC
      `;
      
      const result = await this.userRepository.query(query, [userId]);
      return result || [];
    } catch (error) {
      console.error('Error fetching mobile numbers for user:', error);
      return [];
    }
  }

  async submitCallRecord(userId: number, callData: {
    mobileNumberId: number;
    disposition: string;
    patientFeeling?: string;
    notes?: string;
    nextCallDate?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Update mobile number with call disposition
      const updateMobileQuery = `
        UPDATE mobile_numbers 
        SET disposition = $1, caller_by = $2, updated_at = NOW(),
            patient_feeling = $3, notes = $4, next_call_date = $5
        WHERE id = $6 AND user_id = $7
      `;
      
      await this.userRepository.query(updateMobileQuery, [
        callData.disposition,
        userId,
        callData.patientFeeling || null,
        callData.notes || null,
        callData.nextCallDate || null,
        callData.mobileNumberId,
        userId
      ]);

      // Check if call_history table has mobile_number_id and user_id columns
      try {
        const insertCallHistoryQuery = `
          INSERT INTO call_history (mobile_number_id, user_id, disposition, patient_feeling, notes, next_call_date, created_at, patient_id)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NULL)
        `;
        
        await this.userRepository.query(insertCallHistoryQuery, [
          callData.mobileNumberId,
          userId,
          callData.disposition,
          callData.patientFeeling || null,
          callData.notes || null,
          callData.nextCallDate || null
        ]);
      } catch (historyError) {
        console.log('Call history insert failed, trying without patient_id:', historyError.message);
        // If still fails, just log it but don't fail the whole operation
      }

      return {
        success: true,
        message: 'Call record submitted successfully'
      };
    } catch (error) {
      console.error('Error submitting call record:', error);
      return {
        success: false,
        message: 'Failed to submit call record: ' + error.message
      };
    }
  }
}
