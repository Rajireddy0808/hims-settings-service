import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { CreateAttendanceDto, UpdateAttendanceDto, CheckInOutDto } from '../dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) { }

  async checkInOut(checkInOutDto: CheckInOutDto): Promise<Attendance> {
    const { userId, locationId, type } = checkInOutDto;
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    let attendance = await this.attendanceRepository.findOne({
      where: { userId, locationId, date: today },
      order: { createdAt: 'DESC' },
      select: ['id', 'userId', 'locationId', 'date', 'checkIn', 'checkOut', 'duration', 'status', 'remarks', 'leave_type', 'leave_status', 'userStatusId', 'createdAt', 'updatedAt']
    });

    if (type === 'check-in') {
      // Allow multiple check-ins per day

      // Create new attendance record for check-in
      // Get Available status ID from user_status table
      let defaultStatusId = 1;
      try {
        const availableStatus = await this.attendanceRepository.query(
          'SELECT id FROM user_status WHERE name = $1 AND status = true LIMIT 1',
          ['Available']
        );
        defaultStatusId = availableStatus[0]?.id || 1;
      } catch (error) {
        console.error('Error fetching user status:', error);
      }

      attendance = this.attendanceRepository.create({
        userId,
        locationId,
        date: today,
        checkIn: currentTime,
        status: 'Present',
        userStatusId: defaultStatusId
      });
    } else {
      if (!attendance) {
        throw new BadRequestException('No check-in record found for today');
      }
      if (attendance.checkOut !== null) {
        throw new BadRequestException('Already checked out');
      }

      // Update existing record with check-out
      attendance.checkOut = currentTime;
      attendance.duration = this.calculateDuration(attendance.checkIn, currentTime);
    }

    return await this.attendanceRepository.save(attendance);
  }

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(createAttendanceDto);

    if (attendance.checkIn && attendance.checkOut) {
      attendance.duration = this.calculateDuration(attendance.checkIn, attendance.checkOut);
    }

    return await this.attendanceRepository.save(attendance);
  }

  async findAll(locationId?: number, userId?: number, date?: string, page?: number, limit?: number) {
    const query = this.attendanceRepository.createQueryBuilder('attendance');

    if (locationId) {
      query.andWhere('attendance.locationId = :locationId', { locationId });
    }

    if (userId) {
      query.andWhere('attendance.userId = :userId', { userId });
    }

    if (date) {
      if (date.includes(',')) {
        const [fromDate, toDate] = date.split(',');
        query.andWhere('attendance.date >= :fromDate', { fromDate })
          .andWhere('attendance.date <= :toDate', { toDate });
      } else {
        query.andWhere('attendance.date = :date', { date });
      }
    }

    query.orderBy('attendance.date', 'DESC').addOrderBy('attendance.createdAt', 'DESC');

    if (page && limit) {
      const skip = (page - 1) * limit;
      query.skip(skip).take(limit);

      const [data, totalRecords] = await query.getManyAndCount();
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        data,
        totalRecords,
        totalPages,
        currentPage: page
      };
    }

    return await query.getMany();
  }

  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          username: true,
          firstName: true,
          lastName: true
        }
      }
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);

    Object.assign(attendance, updateAttendanceDto);

    if (attendance.checkIn && attendance.checkOut) {
      attendance.duration = this.calculateDuration(attendance.checkIn, attendance.checkOut);
    }

    return await this.attendanceRepository.save(attendance);
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async getUserTodayAttendance(userId: number, locationId: number): Promise<Attendance[]> {
    const today = new Date().toISOString().split('T')[0];

    return await this.attendanceRepository.find({
      where: { userId, locationId, date: today },
      order: { createdAt: 'ASC' }
    });
  }

  async getAttendanceByDate(userId: number, locationId: number, date: string) {
    const result = await this.attendanceRepository.query(
      `SELECT a.*, us.name as "statusName", us.color_code as "statusColor" 
       FROM attendance a 
       LEFT JOIN user_status us ON a.user_status_id = us.id 
       WHERE a.user_id = $1 AND a.location_id = $2 AND a.date = $3 
       ORDER BY a.created_at ASC`,
      [userId, locationId, date]
    );
    return result;
  }

  async getGroupedAttendance(userId: number, locationId: number) {
    const query = `
      SELECT date::text as date, SUM(duration) as sum, 
             CASE 
               WHEN status = 'Leave' AND leave_status IS NOT NULL THEN CONCAT(status, '(', leave_status, ')')
               ELSE status 
             END as status
      FROM attendance 
      WHERE location_id = $1 AND user_id = $2
      GROUP BY date, status, leave_status
      ORDER BY date::date DESC
    `;

    const result = await this.attendanceRepository.query(query, [locationId, userId]);
    return result;
  }

  async getGroupedAttendancePaginated(userId: number, locationId: number, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT date::text as date, SUM(duration) as sum, 
             CASE 
               WHEN status = 'Leave' AND leave_status IS NOT NULL THEN CONCAT(status, '(', leave_status, ')')
               ELSE status 
             END as status
      FROM attendance 
      WHERE location_id = $1 AND user_id = $2
      GROUP BY date, status, leave_status
      ORDER BY date::date DESC
      LIMIT $3 OFFSET $4
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT date) as total
      FROM attendance 
      WHERE location_id = $1 AND user_id = $2
    `;

    const [data, countResult] = await Promise.all([
      this.attendanceRepository.query(query, [locationId, userId, limit, offset]),
      this.attendanceRepository.query(countQuery, [locationId, userId])
    ]);

    const totalRecords = parseInt(countResult[0]?.total || '0');
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      data,
      totalRecords,
      totalPages,
      currentPage: page
    };
  }



  async updateAvailableStatus(userId: number, locationId: number, userStatusId: number): Promise<Attendance> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0];

      // Get the status name to check if it's 'Offline'
      const statusResult = await this.attendanceRepository.query(
        'SELECT name FROM user_status WHERE id = $1',
        [userStatusId]
      );
      const statusName = statusResult[0]?.name;

      const currentAttendance = await this.attendanceRepository.findOne({
        where: { userId, locationId, date: today, checkOut: null },
        order: { createdAt: 'DESC' }
      });

      if (!currentAttendance) {
        // If no active attendance and status is not 'Offline', create new record
        if (statusName !== 'Offline') {
          const newAttendance = this.attendanceRepository.create({
            userId,
            locationId,
            date: today,
            checkIn: currentTime,
            status: 'Present',
            userStatusId
          });
          return await this.attendanceRepository.save(newAttendance);
        } else {
          throw new NotFoundException('No active attendance record found');
        }
      }

      // If status is same, just return current record
      if (currentAttendance.userStatusId === userStatusId) {
        return currentAttendance;
      }

      if (statusName === 'Offline') {
        // If going offline, checkout current record
        currentAttendance.checkOut = currentTime;
        currentAttendance.duration = this.calculateDuration(currentAttendance.checkIn, currentTime);
        return await this.attendanceRepository.save(currentAttendance);
      } else {
        // For other statuses, just update the status without checkout/checkin
        currentAttendance.userStatusId = userStatusId;
        return await this.attendanceRepository.save(currentAttendance);
      }
    } catch (error) {
      console.error('Error updating available status:', error);
      throw error;
    }
  }

  async getTotalDuration(userId: number, locationId: number, date: string): Promise<number> {
    const attendances = await this.attendanceRepository.find({
      where: { userId, locationId, date }
    });

    return attendances.reduce((total, attendance) => total + (attendance.duration || 0), 0);
  }

  async getAttendanceStats(userId: number, locationId: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const monthStart = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const today = now.toISOString().split('T')[0];

    // Get start of current week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday
    startOfWeek.setDate(now.getDate() + diff);
    const weekStart = startOfWeek.toISOString().split('T')[0];

    try {
      // This month attendance - count distinct dates
      const thisMonthResult = await this.attendanceRepository
        .createQueryBuilder('attendance')
        .select('COUNT(DISTINCT attendance.date)', 'count')
        .where('attendance.userId = :userId', { userId })
        .andWhere('attendance.locationId = :locationId', { locationId })
        .andWhere('attendance.date >= :monthStart', { monthStart })
        .andWhere('attendance.date <= :today', { today })
        .andWhere('attendance.status = :status', { status: 'Present' })
        .getRawOne();

      // This week attendance - count distinct dates
      const thisWeekResult = await this.attendanceRepository
        .createQueryBuilder('attendance')
        .select('COUNT(DISTINCT attendance.date)', 'count')
        .where('attendance.userId = :userId', { userId })
        .andWhere('attendance.locationId = :locationId', { locationId })
        .andWhere('attendance.date >= :weekStart', { weekStart })
        .andWhere('attendance.status = :status', { status: 'Present' })
        .getRawOne();

      const thisMonthAttendance = parseInt(thisMonthResult?.count || '0');
      const thisWeekAttendance = parseInt(thisWeekResult?.count || '0');

      // Monthly attendances for calculations
      const monthlyAttendances = await this.attendanceRepository
        .createQueryBuilder('attendance')
        .where('attendance.userId = :userId', { userId })
        .andWhere('attendance.locationId = :locationId', { locationId })
        .andWhere('attendance.date >= :monthStart', { monthStart })
        .andWhere('attendance.date <= :today', { today })
        .andWhere('attendance.duration > 0')
        .getMany();

      const totalMinutes = monthlyAttendances.reduce((sum, att) => sum + (att.duration || 0), 0);
      const avgHours = monthlyAttendances.length > 0 ? (totalMinutes / monthlyAttendances.length / 60).toFixed(1) : '0.0';

      // Today's total hours
      const todayAttendances = await this.attendanceRepository
        .createQueryBuilder('attendance')
        .where('attendance.userId = :userId', { userId })
        .andWhere('attendance.locationId = :locationId', { locationId })
        .andWhere('attendance.date = :today', { today })
        .andWhere('attendance.duration > 0')
        .getMany();

      const todayTotalMinutes = todayAttendances.reduce((sum, att) => sum + (att.duration || 0), 0);
      const todayHours = (todayTotalMinutes / 60).toFixed(1);

      return {
        thisMonth: thisMonthAttendance,
        thisWeek: thisWeekAttendance,
        avgHours,
        todayHours
      };
    } catch (error) {
      console.error('Error calculating attendance stats:', error);
      return {
        thisMonth: 0,
        thisWeek: 0,
        avgHours: '0.0',
        todayHours: '0.0'
      };
    }
  }


  async getLeaveApplications(locationId?: number, userId?: number, page?: number, limit?: number, fromDate?: string, toDate?: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const query = this.attendanceRepository.createQueryBuilder('attendance')
        .leftJoin('attendance.user', 'user')
        .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
        .addSelect(['attendance.leave_status', 'attendance.leave_type'])
        .where('attendance.status = :status', { status: 'Leave' });

      if (fromDate && toDate) {
        query.andWhere('attendance.date >= :fromDate', { fromDate })
          .andWhere('attendance.date <= :toDate', { toDate });
      } else {
        query.andWhere('attendance.date >= :today', { today });
      }

      if (locationId) {
        query.andWhere('attendance.locationId = :locationId', { locationId });
      }

      if (userId) {
        query.andWhere('attendance.userId = :userId', { userId });
      }

      query.orderBy('attendance.date', 'DESC');

      if (page && limit) {
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);

        const [data, totalRecords] = await query.getManyAndCount();
        const totalPages = Math.ceil(totalRecords / limit);

        return {
          data,
          totalRecords,
          totalPages,
          currentPage: page
        };
      }

      return await query.getMany();
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      return [];
    }
  }


  async getAttendanceReport(locationId: number, fromMonth?: string, toMonth?: string, departmentId?: number, userId?: number, page: number = 1, limit: number = 10) {
    try {
      const currentDate = new Date();
      const defaultMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

      let startDate: string;
      let endDate: string;

      if (fromMonth && toMonth) {
        // Date range filtering
        const [fromYear, fromMonthNum] = fromMonth.split('-').map(Number);
        const [toYear, toMonthNum] = toMonth.split('-').map(Number);
        startDate = `${fromYear}-${fromMonthNum.toString().padStart(2, '0')}-01`;
        endDate = new Date(toYear, toMonthNum, 0).toISOString().split('T')[0];
      } else {
        // Single month filtering (backward compatibility)
        const targetMonth = fromMonth || defaultMonth;
        const [year, monthNum] = targetMonth.split('-').map(Number);
        startDate = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
        endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];
      }

      let query = `
        SELECT
          a.user_id as "userId",
          COALESCE(u.first_name || ' ' || u.last_name, 'User ' || a.user_id) as "userName",
          COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN a.date END) as "attendanceDays",
          COUNT(DISTINCT CASE WHEN a.status LIKE '%Leave%' THEN a.date END) as "leaves"
        FROM attendance a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.location_id = $1 AND a.date >= $2 AND a.date <= $3
      `;

      const params = [locationId, startDate, endDate];
      let paramIndex = 4;

      if (departmentId) {
        query += ` AND u."departmentId" = $${paramIndex}`;
        params.push(departmentId);
        paramIndex++;
      }

      if (userId) {
        query += ` AND a.user_id = $${paramIndex}`;
        params.push(userId);
      }

      query += `
        GROUP BY a.user_id, u.first_name, u.last_name
        ORDER BY a.user_id
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;

      // Count query for pagination
      let countQuery = `
        SELECT COUNT(DISTINCT a.user_id) as total
        FROM attendance a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.location_id = $1 AND a.date >= $2 AND a.date <= $3
      `;

      const countParams = [locationId, startDate, endDate];
      let countParamIndex = 4;

      if (departmentId) {
        countQuery += ` AND u."departmentId" = $${countParamIndex}`;
        countParams.push(departmentId);
        countParamIndex++;
      }

      if (userId) {
        countQuery += ` AND a.user_id = $${countParamIndex}`;
        countParams.push(userId);
      }

      const [reportData, countResult] = await Promise.all([
        this.attendanceRepository.query(query, params),
        this.attendanceRepository.query(countQuery, countParams)
      ]);

      const totalRecords = parseInt(countResult[0]?.total || '0');
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        data: reportData,
        totalRecords,
        totalPages,
        currentPage: page,
        limit
      };
    } catch (error) {
      console.error('Error in getAttendanceReport:', error);
      return [];
    }
  }

   async getDetailedAttendanceReport(locationId: number, fromDate?: string, toDate?: string, departmentId?: number, userId?: number, page: number = 1, limit: number = 10) {
    try {
      let query = `
        SELECT
          a.user_id as "userId",
          COALESCE(u.first_name || ' ' || u.last_name, 'User ' || a.user_id) as "userName",
          a.date::text as date,
          MIN(a.check_in) as "checkIn",
          MAX(a.check_out) as "checkOut",
          FLOOR(SUM(a.duration) / 60) || 'h:' || LPAD((SUM(a.duration) % 60)::text, 2, '0') || 'm' as duration
        FROM attendance a
        LEFT JOIN users u ON u.id = a.user_id
        WHERE a.location_id = $1
      `;
     
      const params: (number | string)[] = [locationId];
     
      if (fromDate && toDate) {
        query += ` AND a.date >= $2 AND a.date <= $3`;
        params.push(fromDate, toDate);
      } else {
        const currentDate = new Date().toISOString().split('T')[0];
        query += ` AND a.date = $2`;
        params.push(currentDate);
      }
     
      if (userId) {
        query += ` AND a.user_id = $${params.length + 1}`;
        params.push(userId);
      }
     
      query += `
        GROUP BY a.date, a.user_id, u.first_name, u.last_name
        ORDER BY a.date DESC, a.user_id
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
     
      const countQuery = `
        SELECT COUNT(DISTINCT a.date || '-' || a.user_id) as total
        FROM attendance a
        WHERE a.location_id = $1` +
        (fromDate && toDate ? ` AND a.date >= $2 AND a.date <= $3` : ` AND a.date = $2`) +
        (userId ? ` AND a.user_id = $${params.length}` : '');
     
      const [reportData, countResult] = await Promise.all([
        this.attendanceRepository.query(query, params),
        this.attendanceRepository.query(countQuery, params)
      ]);
     
      return {
        data: reportData,
        totalRecords: parseInt(countResult[0]?.total || '0'),
        totalPages: Math.ceil(parseInt(countResult[0]?.total || '0') / limit),
        currentPage: page,
        limit
      };
    } catch (error) {
      return { data: [], totalRecords: 0, totalPages: 0, currentPage: 1, limit: 10 };
    }
  }
 
  
  async searchDoctors(searchTerm: string, locationId: number) {
    try {
      const query = `
        SELECT 
          u.id,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          'General' as department,
          COALESCE(us.name, 'Available') as status,
          a.check_in as "checkIn",
          CASE WHEN a.check_out IS NULL AND a.check_in IS NOT NULL THEN true ELSE false END as "isCheckedIn"
        FROM users u
        LEFT JOIN attendance a ON u.id = a.user_id AND a.date = CURRENT_DATE AND a.location_id = $1 AND a.check_out IS NULL
        LEFT JOIN user_status us ON a.user_status_id = us.id
        WHERE LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER($2)
        ORDER BY u.first_name, u.last_name
      `;

      const searchPattern = `%${searchTerm}%`;
      const results = await this.attendanceRepository.query(query, [locationId, searchPattern]);

      return {
        success: true,
        data: results,
        count: results.length
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  private calculateDuration(checkIn: string, checkOut: string): number {
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);

    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;

    return Math.max(0, outMinutes - inMinutes);
  }
}
