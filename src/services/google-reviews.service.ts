import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleReview } from '../entities/google-review.entity';

@Injectable()
export class GoogleReviewsService {
  constructor(
    @InjectRepository(GoogleReview)
    private readonly repo: Repository<GoogleReview>,
  ) {}

  // ── Public: Returns active reviews grouped by branch for the website ──────────
  async getActiveReviewsByBranch(): Promise<Record<string, any[]>> {
    const reviews = await this.repo.find({
      where: { status: 'active' },
      order: { branch_name: 'ASC', createdAt: 'DESC' },
    });

    const grouped: Record<string, any[]> = {
      Miryalaguda: [],
      Narasaraopet: [],
      Ongole: [],
    };

    for (const r of reviews) {
      if (grouped[r.branch_name] !== undefined) {
        grouped[r.branch_name].push({
          name: r.reviewer_name,
          stats: r.reviewer_stats || 'Verified Reviewer',
          date: r.review_date || 'recently',
          text: r.review_text,
          rating: r.rating,
          source: 'Google',
        });
      }
    }

    return grouped;
  }

  // ── Admin CRUD ────────────────────────────────────────────────────────────────
  async findAll(page: number = 1, limit: number = 10): Promise<{ data: GoogleReview[], total: number, page: number, limit: number }> {
    const [data, total] = await this.repo.findAndCount({
      order: { branch_name: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<GoogleReview> {
    const review = await this.repo.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review #${id} not found`);
    return review;
  }

  create(data: Partial<GoogleReview>): Promise<GoogleReview> {
    const review = this.repo.create(data);
    return this.repo.save(review);
  }

  async update(id: number, data: Partial<GoogleReview>): Promise<GoogleReview> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.repo.delete(id);
    return { message: `Review #${id} deleted` };
  }
}
