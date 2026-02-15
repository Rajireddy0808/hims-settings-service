import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSalaryDetails } from '../entities/user-salary-details.entity';
import { Attendance } from '../entities/attendance.entity';
import { Holiday } from '../entities/holiday.entity';

@Injectable()
export class SalaryCalculationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSalaryDetails)
    private salaryRepository: Repository<UserSalaryDetails>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
  ) {}

  async calculateMonthlySalary(locationId: number, month: number, year: number) {
    const users = await this.userRepository.find({ where: { isActive: true } });
    const results = [];

    for (const user of users) {
      const salary = await this.calculateUserSalary(user.id, locationId, month, year);
      results.push(salary);
    }

    return results;
  }

  async calculateUserSalary(userId: number, locationId: number, month: number, year: number) {
    // Get user details
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    // Get latest salary details
    const salaryDetails = await this.salaryRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    if (!salaryDetails) {
      return {
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        message: 'No salary details found'
      };
    }

    const monthlySalary = parseFloat(salaryDetails.salaryAmount.toString());
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const totalDaysInMonth = endDate.getDate();
    const dailySalary = monthlySalary / totalDaysInMonth;

    // Get holidays for all locations
    const holidays = await this.holidayRepository.find({
      where: {
        status: 'active'
      }
    });

    const holidayDates = holidays
      .filter(h => {
        const hDate = new Date(h.date);
        return hDate.getMonth() === month - 1 && hDate.getFullYear() === year;
      })
      .map(h => new Date(h.date).getDate());

    // Get attendance records for all locations
    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.user_id = :userId', { userId })
      .andWhere('attendance.date >= :startDate', { startDate: startDate.toISOString().split('T')[0] })
      .andWhere('attendance.date <= :endDate', { endDate: endDate.toISOString().split('T')[0] })
      .orderBy('attendance.date', 'ASC')
      .getMany();

    console.log('Attendance records for user', userId, ':', attendance.map(a => ({
      date: a.date,
      status: a.status,
      leave_status: a.leave_status
    })));

    // Constants
    const REQUIRED_HOURS = 9;
    const LUNCH_BREAK = 1;
    const TEA_BREAK = 0.25;
    const GRACE_TIME = 0.25;
    const ACTUAL_WORKING_HOURS = REQUIRED_HOURS - LUNCH_BREAK - TEA_BREAK - GRACE_TIME; // 7.5 hours
    const MANDATORY_WEEKOFFS = 4;
    const USABLE_WEEKOFFS = 2;

    let totalWorkedHours = 0;
    let totalWorkedDays = 0;
    let approvedLeaveDays = 0;
    let pendingLeaveDays = 0;
    let absentDays = 0;
    let shortHours = 0;

    // Group attendance by date
    const attendanceByDate = {};
    attendance.forEach(record => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = [];
      }
      attendanceByDate[dateKey].push(record);
    });

    // Calculate for each day
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayRecords = attendanceByDate[dateKey] || [];

      // Skip holidays
      if (holidayDates.includes(day)) {
        continue;
      }

      // Check for approved leave
      const leaveRecord = dayRecords.find(r => 
        r.status?.toLowerCase().includes('leave') && 
        r.leave_status?.toLowerCase() === 'approved'
      );

      if (leaveRecord) {
        approvedLeaveDays++;
        continue;
      }

      // Check for pending leave
      const pendingLeaveRecord = dayRecords.find(r => 
        r.status?.toLowerCase().includes('leave') && 
        r.leave_status?.toLowerCase() === 'pending'
      );

      if (pendingLeaveRecord) {
        pendingLeaveDays++;
        continue;
      }

      // Calculate worked hours for the day from check-in and check-out times
      let dayWorkedMinutes = 0;
      
      dayRecords.forEach(record => {
        if (record.checkIn && record.checkOut) {
          // Parse check-in and check-out times
          const [checkInHours, checkInMinutes, checkInSeconds] = record.checkIn.split(':').map(Number);
          const [checkOutHours, checkOutMinutes, checkOutSeconds] = record.checkOut.split(':').map(Number);
          
          // Calculate total minutes
          const checkInTotalMinutes = checkInHours * 60 + checkInMinutes;
          const checkOutTotalMinutes = checkOutHours * 60 + checkOutMinutes;
          
          dayWorkedMinutes += (checkOutTotalMinutes - checkInTotalMinutes);
        } else if (record.duration) {
          // Fallback to duration if available
          dayWorkedMinutes += parseInt(record.duration.toString());
        }
      });

      const dayWorkedHours = dayWorkedMinutes / 60;

      if (dayWorkedHours > 0) {
        totalWorkedHours += dayWorkedHours;
        
        // Check if day requirement met (7.5 hours)
        if (dayWorkedHours >= ACTUAL_WORKING_HOURS) {
          totalWorkedDays++;
        } else {
          // If less than required hours, deduct proportional salary
          const dayShortHours = ACTUAL_WORKING_HOURS - dayWorkedHours;
          shortHours += dayShortHours;
        }
      } else {
        // No attendance and no approved leave = absent
        absentDays++;
      }
    }

    // Calculate expected working days (excluding holidays and mandatory weekoffs)
    const expectedWorkingDays = totalDaysInMonth - holidayDates.length - MANDATORY_WEEKOFFS;

    // Calculate extra days worked (beyond expected)
    const extraDaysWorked = Math.max(0, totalWorkedDays - expectedWorkingDays);

    // Calculate salary adjustments
    let salaryAddition = 0;
    let salaryDeduction = 0;

    // Deduct for absent days
    salaryDeduction += absentDays * dailySalary;

    // Deduct for short hours (convert to days)
    const shortDays = shortHours / ACTUAL_WORKING_HOURS;
    salaryDeduction += shortDays * dailySalary;

    // Add for extra days worked
    salaryAddition += extraDaysWorked * dailySalary;

    const finalSalary = monthlySalary + salaryAddition - salaryDeduction;

    return {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      month,
      year,
      monthlySalary,
      dailySalary: parseFloat(dailySalary.toFixed(2)),
      totalDaysInMonth,
      expectedWorkingDays,
      totalWorkedDays,
      totalWorkedHours: parseFloat(totalWorkedHours.toFixed(2)),
      approvedLeaveDays,
      pendingLeaveDays,
      absentDays,
      holidayDays: holidayDates.length,
      shortHours: parseFloat(shortHours.toFixed(2)),
      extraDaysWorked,
      salaryAddition: parseFloat(salaryAddition.toFixed(2)),
      salaryDeduction: parseFloat(salaryDeduction.toFixed(2)),
      finalSalary: parseFloat(finalSalary.toFixed(2))
    };
  }
}
