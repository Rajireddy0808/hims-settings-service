import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseConfig } from './config/database.config';
import { JwtStrategy } from './auth/jwt.strategy';

import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { RolesController } from './controllers/roles.controller';
import { DepartmentsController } from './controllers/departments.controller';
import { DepartmentsPublicController } from './controllers/departments-public.controller';
import { LocationsController } from './controllers/locations.controller';
import { LocationsPublicController } from './controllers/locations-public.controller';
import { LocationsManagementController } from './controllers/locations-management.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { ModulesController } from './controllers/modules.controller';
import { TestController } from './controllers/test.controller';
import { DoctorsController } from './controllers/doctors.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { QueueController } from './controllers/queue.controller';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { RolesService } from './services/roles.service';
import { DepartmentsService } from './services/departments.service';
import { LocationsService } from './services/locations.service';
import { PermissionsService } from './services/permissions.service';
import { ModulesService } from './services/modules.service';
import { DoctorsService } from './services/doctors.service';
import { AttendanceService } from './services/attendance.service';
import { QueueService } from './services/queue.service';
import { User } from './entities/user.entity';
import { UserInfo } from './entities/user-info.entity';
import { UserLocationPermission } from './entities/user-location-permission.entity';
import { Role } from './entities/role.entity';
import { Department } from './entities/department.entity';
import { Location } from './entities/location.entity';
import { UserAccess } from './entities/user-access.entity';
import { Module as ModuleEntity } from './entities/module.entity';
import { SubModule } from './entities/sub-module.entity';
import { Permission } from './entities/permission.entity';
import { DoctorTimeslot } from './entities/doctor-timeslot.entity';
import { DoctorConsultationFee } from './entities/doctor-consultation-fee.entity';
import { Attendance } from './entities/attendance.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { UserStatus } from './entities/user-status.entity';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { SystemSettingsController } from './controllers/system-settings.controller';
import { SystemSettingsService } from './services/system-settings.service';
import { UserStatusController } from './controllers/user-status.controller';
import { UserStatusService } from './services/user-status.service';
import { UserLocationService } from './services/user-location.service';
import { BloodGroupController } from './controllers/blood-group.controller';
import { GenderController } from './controllers/gender.controller';
import { MaritalStatusController } from './controllers/marital-status.controller';
import { PatientRegistrationController } from './controllers/patient-registration.controller';
import { PatientAuthController } from './controllers/patient-auth.controller';
import { PatientAppointmentsController } from './controllers/patient-appointments.controller';
import { PatientSourceController } from './controllers/patient-source.controller';
import { FeeMastersController } from './controllers/fee-masters.controller';
import { AppointmentController } from './controllers/appointment.controller';
import { ConsultationModule } from './modules/consultation.module';
import { BloodGroupService } from './services/blood-group.service';
import { GenderService } from './services/gender.service';
import { MaritalStatusService } from './services/marital-status.service';
import { PatientRegistrationService } from './services/patient-registration.service';
import { PatientListService } from './services/patient-list.service';
import { PatientSourceService } from './services/patient-source.service';
import { FeeMastersService } from './services/fee-masters.service';
import { AppointmentService } from './services/appointment.service';
import { MedicalHistoryController } from './controllers/medical-history.controller';
import { MedicalHistoryService } from './services/medical-history.service';
import { PersonalHistoryController } from './controllers/personal-history.controller';
import { PersonalHistoryService } from './services/personal-history.service';
import { LifestyleController } from './controllers/lifestyle.controller';
import { LifestyleService } from './services/lifestyle.service';
import { FamilyHistoryController } from './controllers/family-history.controller';
import { FamilyHistoryService } from './services/family-history.service';
import { DrugHistoryController } from './controllers/drug-history.controller';
import { DrugHistoryService } from './services/drug-history.service';
import { AllergiesController } from './controllers/allergies.controller';
import { AllergiesService } from './services/allergies.service';
import { SocialHistoryController } from './controllers/social-history.controller';
import { SocialHistoryService } from './services/social-history.service';
import { PrescriptionController } from './controllers/prescription.controller';
import { PrescriptionService } from './services/prescription.service';
import { DietChartController } from './controllers/diet-chart.controller';
import { DietChartService } from './services/diet-chart.service';
import { PatientExaminationController } from './controllers/patient-examination.controller';
import { PatientExaminationService } from './services/patient-examination.service';
import { TreatmentPlanMonthController } from './controllers/treatment-plan-month.controller';
import { TreatmentPlanMonthService } from './services/treatment-plan-month.service';
import { TreatmentPlansController } from './controllers/treatment-plans.controller';
import { TreatmentPlansService } from './services/treatment-plans.service';
import { TelecallerController } from './controllers/telecaller.controller';
import { TelecallerService } from './services/telecaller.service';
import { UserTypesController } from './controllers/user-types.controller';
import { UserTypesService } from './services/user-types.service';
import { AppointmentTypeController } from './controllers/appointment-type.controller';
import { AppointmentTypeService } from './services/appointment-type.service';
import { MobileCallController } from './controllers/mobile-call.controller';
import { MobileNumbersController } from './controllers/mobile-numbers.controller';
import { MobileNumbersService } from './services/mobile-numbers.service';
import { MobileNumber } from './entities/mobile-number.entity';
import { MobileNumberNextCall } from './entities/mobile-number-next-call.entity';
import { MobileAssignController } from './controllers/mobile-assign.controller';
import { MobileAssignService } from './services/mobile-assign.service';
import { MobileCallTrackingController } from './controllers/mobile-call-tracking.controller';
import { MobileCallTrackingService } from './services/mobile-call-tracking.service';
import { RenewalController } from './controllers/renewal.controller';
import { RenewalService } from './services/renewal.service';
import { BloodGroup } from './entities/blood-group.entity';
import { Gender } from './entities/gender.entity';
import { MaritalStatus } from './entities/marital-status.entity';
import { Patient } from './entities/patient.entity';
import { PatientSource } from './entities/patient-source.entity';
import { FeeMasters } from './entities/fee-masters.entity';
import { Doctor } from './entities/doctor.entity';
import { Appointment } from './entities/appointment.entity';
import { Consultation } from './entities/consultation.entity';
import { ConsultationPayment } from './entities/consultation-payment.entity';
import { PatientExamination } from './entities/patient-examination.entity';
import { PaymentInstallment } from './entities/payment-installment.entity';
import { TreatmentPlanMonth } from './entities/treatment-plan-month.entity';
import { TreatmentPlan } from './entities/treatment-plan.entity';
import { CallHistory } from './entities/call-history.entity';
import { UserType } from './entities/user-type.entity';
import { AppointmentType } from './entities/appointment-type.entity';
import { PaymentType } from './entities/payment-type.entity';
import { CallHistoryController } from './controllers/call-history.controller';
import { CallHistoryService } from './services/call-history.service';
import { PaymentTypeController } from './controllers/payment-type.controller';
import { PaymentTypeService } from './services/payment-type.service';
import { ExpenseCategoriesController } from './controllers/expense-categories.controller';
import { EmployeeExpensesController } from './controllers/employee-expenses.controller';
import { TodayCollectionsController } from './controllers/today-collections.controller';
import { CashCollectionsController } from './controllers/cash-collections.controller';
import { LocationsIpController } from './controllers/locationsip.controller';
import { HolidaysController } from './controllers/holidays.controller';
import { SalaryCalculationController } from './controllers/salary-calculation.controller';
import { SalaryCalculationService } from './services/salary-calculation.service';
import { UserSalaryController } from './controllers/user-salary.controller';
import { UserSalaryService } from './services/user-salary.service';
import { UserSalaryDetails } from './entities/user-salary-details.entity';
import { ExpenseCategoriesService } from './services/expense-categories.service';
import { LocationsIpService } from './services/locationsip.service';
import { HolidaysService } from './services/holidays.service';
import { EmployeeExpensesService } from './services/employee-expenses.service';
import { TodayCollectionsService } from './services/today-collections.service';
import { CashCollectionsService } from './services/cash-collections.service';
import { ExpenseCategory } from './entities/expense-category.entity';
import { EmployeeExpense } from './entities/employee-expense.entity';
import { Holiday } from './entities/holiday.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    PassportModule,
    JwtModule.register({
      secret: '3I3zCSdmG2Qt8X0lHvKkC5fsQp8Wfpx9MFdECFs9CS9Cu97GMrrpdptIxsP8sYPr',
      signOptions: { expiresIn: '24h' },
    }),
    ConsultationModule,
    TypeOrmModule.forFeature([
      User,
      UserInfo,
      UserLocationPermission,
      Role,
      Department,
      Location,
      UserAccess,
      ModuleEntity,
      SubModule,
      Permission,
      DoctorTimeslot,
      DoctorConsultationFee,
      Attendance,
      SystemSetting,
      UserStatus,
      BloodGroup,
      Gender,
      MaritalStatus,
      Patient,
      PatientSource,
      FeeMasters,
      Doctor,
      Appointment,
      PatientExamination,
      PaymentInstallment,
      TreatmentPlanMonth,
      TreatmentPlan,
      CallHistory,
      UserType,
      AppointmentType,
      MobileNumber,
      MobileNumberNextCall,
      PaymentType,
      ExpenseCategory,
      EmployeeExpense,
      Holiday,
      UserSalaryDetails,
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    DepartmentsController,
    DepartmentsPublicController,
    LocationsController,
    LocationsPublicController,
    LocationsManagementController,
    PermissionsController,
    ModulesController,
    TestController,
    DoctorsController,
    AttendanceController,
    QueueController,
    ProfileController,
    SystemSettingsController,
    UserStatusController,
    BloodGroupController,
    GenderController,
    MaritalStatusController,
    PatientRegistrationController,
    PatientAuthController,
    PatientAppointmentsController,
    PatientSourceController,
    FeeMastersController,
    AppointmentController,
    MedicalHistoryController,
    PersonalHistoryController,
    LifestyleController,
    FamilyHistoryController,
    DrugHistoryController,
    AllergiesController,
    SocialHistoryController,
    PatientExaminationController,
    TreatmentPlanMonthController,
    TreatmentPlansController,
    PrescriptionController,
    DietChartController,
    TelecallerController,
    UserTypesController,
    AppointmentTypeController,
    MobileCallController,
    MobileNumbersController,
    MobileAssignController,
    MobileCallTrackingController,
    CallHistoryController,
    RenewalController,
    PaymentTypeController,
    ExpenseCategoriesController,
    EmployeeExpensesController,
    TodayCollectionsController,
    CashCollectionsController,
    LocationsIpController,
    HolidaysController,
    UserSalaryController,
    SalaryCalculationController
  ],
  providers: [
    AuthService,
    UsersService,
    RolesService,
    DepartmentsService,
    LocationsService,
    PermissionsService,
    ModulesService,
    DoctorsService,
    AttendanceService,
    QueueService,
    JwtStrategy,
    ProfileService,
    SystemSettingsService,
    UserStatusService,
    UserLocationService,
    BloodGroupService,
    GenderService,
    MaritalStatusService,
    PatientRegistrationService,
    PatientListService,
    PatientSourceService,
    FeeMastersService,
    AppointmentService,
    MedicalHistoryService,
    PersonalHistoryService,
    LifestyleService,
    FamilyHistoryService,
    DrugHistoryService,
    AllergiesService,
    SocialHistoryService,
    PatientExaminationService,
    TreatmentPlanMonthService,
    TreatmentPlansService,
    PrescriptionService,
    DietChartService,
    TelecallerService,
    UserTypesService,
    AppointmentTypeService,
    MobileNumbersService,
    MobileAssignService,
    MobileCallTrackingService,
    CallHistoryService,
    RenewalService,
    PaymentTypeService,
    ExpenseCategoriesService,
    EmployeeExpensesService,
    TodayCollectionsService,
    CashCollectionsService,
    LocationsIpService,
    HolidaysService,
    UserSalaryService,
    SalaryCalculationService
  ],
})
export class AppModule {}
