import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserInfo } from '../entities/user-info.entity';
import { Department } from '../entities/department.entity';
import { Attendance } from '../entities/attendance.entity';
import { UserLocationPermission } from '../entities/user-location-permission.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserInfo)
    private userInfoRepository: Repository<UserInfo>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(UserLocationPermission)
    private userLocationPermissionRepository: Repository<UserLocationPermission>,
  ) {}

  async getDoctorsByDepartment(locationId: number = 1) {
    try {
      const today = new Date().toISOString().split('T')[0];

      
      // Get all departments for the location
      const departments = await this.departmentRepository.find({
        where: { locationId, isActive: true }
      });
      


      const result = {};

    for (const department of departments) {
      // Get doctors for this department
      const doctorUsers = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userInfo', 'userInfo')
        .leftJoin('user_location_permissions', 'ulp', 'ulp.user_id = user.id')
        .select([
          'user.id',
          'user.firstName', 
          'user.lastName',
          'user.working_days',
          'user.working_hours',
          'userInfo.userType'
        ])
        .where('userInfo.userType = :userType', { userType: 'doctor' })
        .andWhere('ulp.department_id = :departmentId', { departmentId: department.id })
        .andWhere('ulp.location_id = :locationId', { locationId })
        .andWhere('ulp.is_active = true')
        .andWhere('user.isActive = true')
        .getMany();

      const doctors = [];
      for (const user of doctorUsers) {
        // Get latest attendance record for this user with user status
        const latestAttendance = await this.attendanceRepository.query(
          `SELECT a.*, us.name as status_name, us.color_code 
           FROM attendance a 
           LEFT JOIN user_status us ON a.user_status_id = us.id 
           WHERE a.user_id = $1 AND a.date = $2 AND a.location_id = $3 
           ORDER BY a.id DESC LIMIT 1`,
          [user.id, today, locationId]
        );

        doctors.push({
          user_id: user.id,
          user_firstName: user.firstName,
          user_lastName: user.lastName,
          working_days: user.workingDays,
          working_hours: user.workingHours,
          userInfo_userType: user.userInfo?.userType,
          attendance_availableStatus: latestAttendance[0]?.status_name,
          attendance_checkIn: latestAttendance[0]?.check_in,
          attendance_checkOut: latestAttendance[0]?.check_out,
          attendance_status: latestAttendance[0]?.status
        });
      }



      // Only add department if it has doctors
      if (doctors.length > 0) {
        // Transform the data with attendance-based availability logic
        const transformedDoctors = doctors.map(doctor => {
          // Determine availability based on checkout status and latest user status
          let availabilityStatus = 'Not Available';
          
          if (doctor.attendance_status === 'Present') {
            if (doctor.attendance_checkOut) {
              // If checked out, doctor is not available
              availabilityStatus = 'Not Available';
            } else {
              // If checked in and no checkout, use the latest status from user_status table
              availabilityStatus = doctor.attendance_availableStatus || 'Available';
            }
          } else {
            // If not present today, check if there's any status record
            availabilityStatus = doctor.attendance_availableStatus || 'Not Available';
          }
          
          return {
            id: doctor.user_id,
            name: `${doctor.user_firstName} ${doctor.user_lastName}`,
            status: availabilityStatus,
            consultingRoom: `Room ${department.name.substring(0, 3).toUpperCase()}${doctor.user_id}`,
            currentPatient: null,
            isCheckedIn: doctor.attendance_status === 'Present' && !doctor.attendance_checkOut,
            checkInTime: doctor.attendance_checkIn || null,
            working_days: doctor.working_days,
            working_hours: doctor.working_hours,
          };
        });

        // Use department name as key (lowercase, spaces replaced with underscores)
        const deptKey = department.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        result[deptKey] = transformedDoctors;
      }
    }


      
      return {
        doctorsByDepartment: result
      };
    } catch (error) {
      console.error('Error in getDoctorsByDepartment:', error);
      throw error;
    }
  }


}
