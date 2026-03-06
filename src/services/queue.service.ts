import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserInfo } from '../entities/user-info.entity';
import { Department } from '../entities/department.entity';
import { Attendance } from '../entities/attendance.entity';
import { UserLocationPermission } from '../entities/user-location-permission.entity';
import { Subject } from 'rxjs';

@Injectable()
export class QueueService {
  public queueUpdateSubject = new Subject<{ locationId: number }>();

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
    private dataSource: DataSource,
  ) { }

  async getQueueAppointments(locationId: number) {
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // Format: YYYY-MM-DD

      const appointments = await this.dataSource.query(`
        SELECT 
          a.id,
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_date,
          a.appointment_time,
          a.appointment_type,
          a.appointment_type_id,
          a.status,
          a.notes,
          a.location_id,
          l.name as location_name,
          a.created_at,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name,
          p.mobile as patient_phone,
          p.patient_id as patient_reg_id,
          d.first_name as doctor_first_name,
          d.last_name as doctor_last_name,
          at.name as appointment_type_name,
          at.code as appointment_type_code
        FROM appointments a
        LEFT JOIN patients p ON p.id = a.patient_id
        LEFT JOIN users d ON d.id = a.doctor_id
        LEFT JOIN appointment_types at ON at.id = a.appointment_type_id
        LEFT JOIN locations l ON l.id = a.location_id
        WHERE a.location_id = $1
          AND a.appointment_date = $2
        ORDER BY a.doctor_id, a.appointment_time ASC, a.created_at ASC
      `, [locationId, today]);

      // Group by doctor
      const doctorMap: Record<string, any> = {};

      appointments.forEach((apt: any, index: number) => {
        const doctorKey = apt.doctor_id;
        const doctorName = `${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim() || `Doctor #${apt.doctor_id}`;

        if (!doctorMap[doctorKey]) {
          doctorMap[doctorKey] = {
            doctorId: apt.doctor_id,
            doctorName: doctorName,
            locationId: apt.location_id,
            locationName: apt.location_name || 'General',
            patients: [],
          };
        }

        // Determine queue status - map DB statuses to queue statuses
        const rawStatus = (apt.status || '').toLowerCase();
        let status = 'waiting'; // default
        if (rawStatus === 'with_doctor' || rawStatus === 'in_progress') {
          status = 'with_doctor';
        } else if (rawStatus === 'completed' || rawStatus === 'done') {
          status = 'completed';
        } else if (rawStatus === 'cancelled' || rawStatus === 'no_show') {
          status = rawStatus;
        }
        // All others (scheduled, pending, waiting, empty) => waiting

        doctorMap[doctorKey].patients.push({
          id: apt.id,
          appointmentId: apt.appointment_id,
          patientId: apt.patient_id,
          patientRegId: apt.patient_reg_id || `P${apt.patient_id}`,
          patientName: `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim() || `Patient #${apt.patient_id}`,
          patientPhone: apt.patient_phone || 'N/A',
          appointmentTime: apt.appointment_time,
          appointmentType: apt.appointment_type_code || apt.appointment_type || 'consultation',
          typeName: apt.appointment_type_name || 'Consultation',
          status: status,
          notes: apt.notes,
          queuePosition: doctorMap[doctorKey].patients.length + 1,
        });
      });

      // Convert map to array and compute current/waiting counts
      const doctors = Object.values(doctorMap).map((doc: any) => {
        const currentPatient = doc.patients.find((p: any) => p.status === 'with_doctor');
        const waitingPatients = doc.patients.filter((p: any) => p.status === 'waiting');
        const completedPatients = doc.patients.filter((p: any) => p.status === 'completed');

        return {
          ...doc,
          currentPatient: currentPatient || null,
          waitingCount: waitingPatients.length,
          completedCount: completedPatients.length,
          totalCount: doc.patients.length,
        };
      });

      return {
        doctors,
        locationId,
        date: today,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in getQueueAppointments:', error);
      return { doctors: [], locationId, date: new Date().toISOString().split('T')[0], timestamp: new Date().toISOString() };
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: string) {
    try {
      const validStatuses = ['waiting', 'with_doctor', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      await this.dataSource.query(
        `UPDATE appointments SET status = $1 WHERE appointment_id = $2`,
        [status, appointmentId]
      );

      // Get location_id to emit targeted update
      const appointmentLocations = await this.dataSource.query(
        `SELECT p.location_id FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         WHERE a.appointment_id = $1`,
        [appointmentId]
      );

      if (appointmentLocations.length > 0) {
        this.queueUpdateSubject.next({ locationId: appointmentLocations[0].location_id });
      }

      return { message: 'Status updated', appointmentId, status };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  async getDoctorsByDepartment(locationId: number) {
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

