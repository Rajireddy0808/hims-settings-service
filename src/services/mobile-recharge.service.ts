import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { MobileOperator } from '../entities/mobile-operator.entity';
import { MobileSimMaster } from '../entities/mobile-sim-master.entity';
import { MobileRechargePlan } from '../entities/mobile-recharge-plan.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class MobileRechargeService {
  constructor(
    @InjectRepository(MobileOperator)
    private operatorRepository: Repository<MobileOperator>,
    @InjectRepository(MobileSimMaster)
    private simMasterRepository: Repository<MobileSimMaster>,
    @InjectRepository(MobileRechargePlan)
    private rechargePlanRepository: Repository<MobileRechargePlan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Operator Masters
  async createOperator(name: string) {
    const operator = this.operatorRepository.create({ name });
    return this.operatorRepository.save(operator);
  }

  async getOperators() {
    return this.operatorRepository.find({ order: { name: 'ASC' } });
  }

  // SIM Masters
  async createSimMaster(mobileNumber: string, operatorId: number) {
    const sim = this.simMasterRepository.create({ mobileNumber, operatorId });
    return this.simMasterRepository.save(sim);
  }

  async getSimMasters() {
    return this.simMasterRepository.find({
      relations: ['operator'],
      order: { mobileNumber: 'ASC' }
    });
  }

  // Recharge Plans
  async createRechargePlan(data: {
    simMasterId: number;
    userId: number;
    rechargeDays: number;
    amount: number;
    rechargeDate: string;
  }) {
    const rechargeDate = new Date(data.rechargeDate);
    const nextRechargeDate = new Date(rechargeDate);
    nextRechargeDate.setDate(rechargeDate.getDate() + data.rechargeDays);

    const plan = this.rechargePlanRepository.create({
      ...data,
      nextRechargeDate: nextRechargeDate.toISOString().split('T')[0]
    });
    return this.rechargePlanRepository.save(plan);
  }

  async updateRechargePlan(id: number, data: {
    rechargeDays?: number;
    amount?: number;
    rechargeDate?: string;
  }) {
    const plan = await this.rechargePlanRepository.findOne({ where: { id } });
    if (!plan) throw new Error('Plan not found');

    if (data.rechargeDays !== undefined) plan.rechargeDays = data.rechargeDays;
    if (data.amount !== undefined) plan.amount = data.amount;
    if (data.rechargeDate) plan.rechargeDate = data.rechargeDate;

    const rechargeDate = new Date(plan.rechargeDate);
    const nextRechargeDate = new Date(rechargeDate);
    nextRechargeDate.setDate(rechargeDate.getDate() + plan.rechargeDays);
    plan.nextRechargeDate = nextRechargeDate.toISOString().split('T')[0];

    return this.rechargePlanRepository.save(plan);
  }

  async getEmployeeRechargeList() {
    // Get the latest plan ID for each simMasterId
    const latestPlanIdsQuery = await this.rechargePlanRepository
      .createQueryBuilder('plan')
      .select('MAX(plan.id)', 'id')
      .groupBy('plan.sim_master_id')
      .getRawMany();
    
    const ids = latestPlanIdsQuery.map(p => p.id);
    if (ids.length === 0) return [];

    return this.rechargePlanRepository.find({
      where: ids.map(id => ({ id })),
      relations: ['simMaster', 'simMaster.operator', 'user'],
      order: { nextRechargeDate: 'ASC' }
    });
  }

  async getUnassignedSims() {
    // Basic implementation: find SIMs not in any active plan
    // In a real scenario, you might want a more complex check
    const assignedSimIds = await this.rechargePlanRepository
      .createQueryBuilder('plan')
      .select('plan.sim_master_id')
      .getRawMany();
    
    const ids = assignedSimIds.map(a => a.sim_master_id);
    
    const query = this.simMasterRepository.createQueryBuilder('sim')
      .leftJoinAndSelect('sim.operator', 'operator');
    
    if (ids.length > 0) {
      query.where('sim.id NOT IN (:...ids)', { ids });
    }
    
    return query.getMany();
  }
  async getHistoryBySim(simMasterId: number) {
    return this.rechargePlanRepository.find({
      where: { simMasterId },
      relations: ['user'],
      order: { rechargeDate: 'DESC' }
    });
  }
}
