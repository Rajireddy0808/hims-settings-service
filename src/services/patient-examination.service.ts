import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientExamination } from '../entities/patient-examination.entity';
import { PaymentInstallment } from '../entities/payment-installment.entity';

@Injectable()
export class PatientExaminationService {
  constructor(
    @InjectRepository(PatientExamination)
    private patientExaminationRepository: Repository<PatientExamination>,
    @InjectRepository(PaymentInstallment)
    private paymentInstallmentRepository: Repository<PaymentInstallment>,
  ) {}

  async create(createExaminationDto: any, userId: number): Promise<PatientExamination> {
    const examination = this.patientExaminationRepository.create({
      ...createExaminationDto,
      createdBy: userId,
    });
    const result = await this.patientExaminationRepository.save(examination);
    return Array.isArray(result) ? result[0] : result;
  }

  async findByPatientId(patientId: string): Promise<PatientExamination[]> {
    return this.patientExaminationRepository.find({
      where: { patientId: parseInt(patientId) },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestByPatientId(patientId: string): Promise<PatientExamination> {
    return this.patientExaminationRepository.findOne({
      where: { patientId: parseInt(patientId) },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateExaminationDto: any): Promise<PatientExamination> {
    await this.patientExaminationRepository.update(id, updateExaminationDto);
    return await this.patientExaminationRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.patientExaminationRepository.delete(id);
  }

  async savePayments(examinationId: number, paymentData: any): Promise<any> {
    const { totalAmount, discountAmount, paidAmount, dueAmount, paymentMethods } = paymentData;
    
    // Update patient examination using raw query
    await this.patientExaminationRepository.query(
      'UPDATE patient_examination SET total_amount = $1, discount_amount = $2, paid_amount = $3, due_amount = $4 WHERE id = $5',
      [totalAmount, discountAmount, paidAmount, dueAmount, examinationId]
    );

    // Delete existing installments only
    await this.paymentInstallmentRepository.delete({ patientExaminationId: examinationId });

    // Insert installments only
    let installmentNumber = 1;
    for (const payment of paymentMethods) {
      await this.paymentInstallmentRepository.save({
        patientExaminationId: examinationId,
        installmentNumber: installmentNumber++,
        paymentMethod: payment.method,
        amount: payment.amount,
        notes: 'Initial payment'
      });
    }

    return { message: 'Payment details saved successfully' };
  }

  async getPayments(examinationId: number): Promise<any> {
    const examination = await this.patientExaminationRepository.findOne({
      where: { id: examinationId }
    });

    const installments = await this.paymentInstallmentRepository.find({
      where: { patientExaminationId: examinationId }
    });

    return {
      totalAmount: examination?.totalAmount || 0,
      discountAmount: examination?.discountAmount || 0,
      paidAmount: examination?.paidAmount || 0,
      dueAmount: examination?.dueAmount || 0,
      paymentMethods: installments
    };
  }



  async addPayment(examinationId: number, paymentData: { paymentMethod: string; amount: number; notes?: string }): Promise<any> {
    // Use raw query to ensure update works
    const examination = await this.patientExaminationRepository.query(
      'SELECT * FROM patient_examination WHERE id = $1', [examinationId]
    );

    if (!examination || examination.length === 0) {
      throw new Error('Examination not found');
    }

    const exam = examination[0];

    // Get next installment number
    const lastInstallment = await this.paymentInstallmentRepository.findOne({
      where: { patientExaminationId: examinationId },
      order: { installmentNumber: 'DESC' }
    });
    const nextInstallmentNumber = (lastInstallment?.installmentNumber || 0) + 1;

    // Add new installment record
    await this.paymentInstallmentRepository.save({
      patientExaminationId: examinationId,
      installmentNumber: nextInstallmentNumber,
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      notes: paymentData.notes || null
    });

    // Calculate new amounts
    const currentPaidAmount = parseFloat(exam.paid_amount || '0');
    const newPaidAmount = currentPaidAmount + parseFloat(paymentData.amount.toString());
    const totalAmount = parseFloat(exam.total_amount || '0');
    const discountAmount = parseFloat(exam.discount_amount || '0');
    const newDueAmount = Math.max(0, totalAmount - discountAmount - newPaidAmount);

    // Update using raw query
    await this.patientExaminationRepository.query(
      'UPDATE patient_examination SET paid_amount = $1, due_amount = $2 WHERE id = $3',
      [newPaidAmount, newDueAmount, examinationId]
    );

    return {
      message: 'Payment installment added successfully',
      installmentNumber: nextInstallmentNumber,
      totalAmount: totalAmount,
      discountAmount: discountAmount,
      paidAmount: newPaidAmount,
      dueAmount: newDueAmount
    };
  }

  async getPaymentInstallments(examinationId: number): Promise<any> {
    const installments = await this.paymentInstallmentRepository.find({
      where: { patientExaminationId: examinationId },
      order: { installmentNumber: 'ASC' }
    });

    return installments;
  }

  async debugExamination(examinationId: number): Promise<any> {
    const examination = await this.patientExaminationRepository.findOne({
      where: { id: examinationId }
    });
    return examination;
  }

  async getPaymentReceipt(examinationId: number): Promise<any> {
    const examination = await this.patientExaminationRepository.query(
      'SELECT * FROM patient_examination WHERE id = $1', [examinationId]
    );

    if (!examination || examination.length === 0) {
      throw new Error('Examination not found');
    }

    const exam = examination[0];
    
    // Get patient details from database
    const patient = await this.patientExaminationRepository.query(
      'SELECT * FROM patients WHERE id = $1', [exam.patient_id]
    );
    const patientData = patient[0] || null;

    const installments = await this.paymentInstallmentRepository.find({
      where: { patientExaminationId: examinationId },
      order: { installmentNumber: 'ASC' }
    });

    return {
      receiptNo: `RCP-${examinationId}`,
      date: new Date().toLocaleDateString(),
      patient: patientData || {},
      examination: exam,
      installments: installments,
      totalAmount: exam.total_amount || 0,
      discountAmount: exam.discount_amount || 0,
      paidAmount: exam.paid_amount || 0,
      dueAmount: exam.due_amount || 0
    };
  }

  async getInstallmentReceipt(installmentId: number): Promise<any> {
    const installment = await this.paymentInstallmentRepository.findOne({
      where: { id: installmentId }
    });

    if (!installment) {
      throw new Error('Installment not found');
    }

    const examination = await this.patientExaminationRepository.query(
      'SELECT * FROM patient_examination WHERE id = $1', [installment.patientExaminationId]
    );

    const exam = examination[0];
    
    const patient = await this.patientExaminationRepository.query(
      'SELECT * FROM patients WHERE id = $1', [exam.patient_id]
    );
    const patientData = patient[0] || null;

    return {
      receiptNo: `RCP-${installment.patientExaminationId}-${installment.installmentNumber}`,
      date: new Date(installment.paymentDate).toLocaleDateString(),
      patient: patientData || {},
      examination: exam,
      installment: installment,
      totalAmount: exam.total_amount || 0,
      discountAmount: exam.discount_amount || 0,
      paidAmount: installment.amount,
      dueAmount: exam.due_amount || 0
    };
  }

  async getDailyReceipt(examinationId: number): Promise<any> {
    const examination = await this.patientExaminationRepository.query(
      'SELECT * FROM patient_examination WHERE id = $1', [examinationId]
    );

    if (!examination || examination.length === 0) {
      throw new Error('Examination not found');
    }

    const exam = examination[0];
    
    const patient = await this.patientExaminationRepository.query(
      'SELECT * FROM patients WHERE id = $1', [exam.patient_id]
    );
    const patientData = patient[0] || null;

    // Get today's payments only
    const today = new Date().toISOString().split('T')[0];
    const todayInstallments = await this.paymentInstallmentRepository.query(
      'SELECT * FROM payment_installments WHERE patient_examination_id = $1 AND DATE(payment_date) = $2 ORDER BY installment_number ASC',
      [examinationId, today]
    );

    const totalTodayAmount = todayInstallments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0);

    return {
      receiptNo: `RCP-${examinationId}-${today}`,
      date: new Date().toLocaleDateString(),
      patient: patientData || {},
      examination: exam,
      installments: todayInstallments,
      totalAmount: exam.total_amount || 0,
      discountAmount: exam.discount_amount || 0,
      paidAmount: totalTodayAmount,
      dueAmount: exam.due_amount || 0,
      isDailyReceipt: true
    };
  }

  async updateNRList(updateData: any): Promise<any> {
    const result = await this.patientExaminationRepository.query(`
      UPDATE patient_examination 
      SET 
        treatment_plan_months_pro = $1,
        next_renewal_date_pro = $2,
        total_amount = $3,
        discount_amount = $4,
        paid_amount = $5,
        due_amount = $6
      WHERE treatment_plan_months_pro IS NULL
        AND next_renewal_date_pro IS NULL
        AND total_amount = 0 
        AND discount_amount = 0 
        AND paid_amount = 0 
        AND due_amount = 0
    `, [
      updateData.treatmentPlanMonths,
      updateData.nextRenewalDate,
      updateData.totalAmount,
      updateData.discountAmount,
      updateData.paidAmount,
      updateData.dueAmount
    ]);

    return { message: 'NR List updated successfully', affectedRows: result[1] };
  }

  async getDuePatients(page: number = 1, limit: number = 10): Promise<any> {
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await this.patientExaminationRepository.query(`
      SELECT COUNT(DISTINCT pe.patient_id) as total
      FROM patient_examination pe
      WHERE pe.due_amount != 0
    `);
    
    const total = parseInt(countResult[0].total);
    
    // Get paginated data
    const duePatients = await this.patientExaminationRepository.query(`
      SELECT DISTINCT ON (pe.patient_id)
        pe.id,
        pe.patient_id,
        pe.total_amount,
        pe.discount_amount,
        pe.paid_amount,
        pe.due_amount,
        pe.created_at,
        p.first_name,
        p.last_name,
        p.mobile,
        p.patient_id as patient_code
      FROM patient_examination pe
      LEFT JOIN patients p ON pe.patient_id = p.id
      WHERE pe.due_amount != 0
      ORDER BY pe.patient_id, pe.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const data = duePatients.map(item => ({
      id: item.id,
      patientId: item.patient_id,
      patientCode: item.patient_code,
      patientName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A',
      mobileNumber: item.mobile,
      totalAmount: item.total_amount || 0,
      discountAmount: item.discount_amount || 0,
      paidAmount: item.paid_amount || 0,
      dueAmount: item.due_amount || 0,
      createdAt: item.created_at
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async getNRList(page: number = 1, limit: number = 10, fromDate?: string, toDate?: string): Promise<any> {
    const offset = (page - 1) * limit;
    
    let dateFilter = '';
    const countParams: any[] = [];
    const queryParams: any[] = [limit, offset];
    
    if (fromDate) {
      dateFilter += ` AND pe.next_renewal_date_doctor >= $${countParams.length + 1}`;
      countParams.push(fromDate);
      queryParams.push(fromDate);
    }
    
    if (toDate) {
      dateFilter += ` AND pe.next_renewal_date_doctor <= $${countParams.length + 1}`;
      countParams.push(toDate);
      queryParams.push(toDate);
    }
    
    // Get total count
    const countResult = await this.patientExaminationRepository.query(`
      SELECT COUNT(DISTINCT pe.patient_id) as total
      FROM patient_examination pe
      WHERE pe.treatment_plan_months_pro IS NULL
        AND pe.next_renewal_date_pro IS NULL
        AND pe.total_amount = 0
        AND pe.discount_amount = 0
        AND pe.paid_amount = 0
        AND pe.due_amount = 0
        ${dateFilter}
    `, countParams);
    
    const total = parseInt(countResult[0].total);
    
    // Get paginated data
    const nrList = await this.patientExaminationRepository.query(`
      SELECT DISTINCT ON (pe.patient_id)
        pe.id,
        pe.patient_id,
        pe.treatment_plan_months_pro,
        pe.treatment_plan_months_doctor,
        pe.next_renewal_date_pro,
        pe.next_renewal_date_doctor,
        pe.total_amount,
        pe.discount_amount,
        pe.paid_amount,
        pe.due_amount,
        pe.created_at,
        p.first_name,
        p.last_name,
        p.mobile,
        p.patient_id as patient_code
      FROM patient_examination pe
      LEFT JOIN patients p ON pe.patient_id = p.id
      WHERE pe.treatment_plan_months_pro IS NULL
        AND pe.next_renewal_date_pro IS NULL
        AND pe.total_amount = 0
        AND pe.discount_amount = 0
        AND pe.paid_amount = 0
        AND pe.due_amount = 0
        ${dateFilter.replace(/\$\d+/g, (match) => {
          const num = parseInt(match.substring(1));
          return `$${num + 2}`;
        })}
      ORDER BY pe.patient_id, pe.created_at DESC
      LIMIT $1 OFFSET $2
    `, queryParams);

    const data = nrList.map(item => ({
      id: item.id,
      patientId: item.patient_id,
      patientCode: item.patient_code,
      patientName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A',
      mobileNumber: item.mobile,
      treatmentPlanMonths: item.treatment_plan_months_doctor || null,
      nextRenewalDate: item.next_renewal_date_doctor || null
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
}
