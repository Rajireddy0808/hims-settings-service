import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutContent } from '../entities/about-content.entity';

@Injectable()
export class AboutService implements OnModuleInit {
  constructor(
    @InjectRepository(AboutContent)
    private aboutRepository: Repository<AboutContent>,
  ) {}

  async onModuleInit() {
    console.log('🚀 Checking and updating About database schema...');
    try {
      // Create table if it doesn't exist (TypeORM usually handles this but we'll be safe)
      await this.aboutRepository.query(`
        CREATE TABLE IF NOT EXISTS "about_content" (
          "id" SERIAL PRIMARY KEY,
          "title" VARCHAR(500) NOT NULL,
          "description" TEXT,
          "status" VARCHAR(20) DEFAULT 'active',
          "image_urls" TEXT,
          "created_at" TIMESTAMP DEFAULT now(),
          "updated_at" TIMESTAMP DEFAULT now()
        );
      `);
      
      // Ensure columns exist (simple migration)
      await this.aboutRepository.query(`
        ALTER TABLE "about_content" ADD COLUMN IF NOT EXISTS "image_urls" TEXT;
      `);
      
      await this.seedInitial();
      console.log('✅ About database schema and seed completed.');
    } catch (error) {
      console.warn('⚠️ About database initialization warning:', error.message);
    }
  }

  async create(createAboutDto: any): Promise<AboutContent> {
    const about = this.aboutRepository.create(createAboutDto as object);
    return await this.aboutRepository.save(about as AboutContent);
  }

  async findAll(): Promise<AboutContent[]> {
    return await this.aboutRepository.find({
      order: { recordCreatedAt: 'DESC' },
    });
  }

  async getActive(): Promise<AboutContent | null> {
    return await this.aboutRepository.findOne({
      where: { status: 'active' },
      order: { recordCreatedAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<AboutContent> {
    const about = await this.aboutRepository.findOne({ where: { id } });
    if (!about) {
      throw new NotFoundException(`About content with ID ${id} not found`);
    }
    return about;
  }

  async update(id: number, updateAboutDto: any): Promise<AboutContent> {
    const about = await this.findOne(id);
    Object.assign(about, updateAboutDto);
    return await this.aboutRepository.save(about);
  }

  async remove(id: number): Promise<void> {
    const about = await this.findOne(id);
    await this.aboutRepository.remove(about);
  }

  async seedInitial(): Promise<void> {
    const count = await this.aboutRepository.count();
    if (count === 0) {
      const initialAbout = {
        title: "The Natural science\nWHAT IS HOMEOPATHY?",
        description: "Homeopathy is an alternative healthcare system acknowledged by many global health communities. It originated in Germany and is now widely practiced and respected in India. Homeopathy offers safe, natural treatment for many chronic conditions, with virtually no side effects. It works by strengthening the body's immune system and helping to develop resilience to fight long-term health issues.\n\nUni Care Group has 4 branches and over 30 qualified doctors. We follow an evidence-based homeopathic practice that considers both mental and physical health. Our treatments are cost-effective, provide rapid relief, and are centered around patient care.",
        status: "active",
        image_urls: []
      };
      await this.create(initialAbout);
    }
  }
}
