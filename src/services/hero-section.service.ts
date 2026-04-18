import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSection } from '../entities/hero-section.entity';

@Injectable()
export class HeroSectionService implements OnModuleInit {
  constructor(
    @InjectRepository(HeroSection)
    private readonly heroSectionRepository: Repository<HeroSection>,
  ) {}

  async onModuleInit() {
    await this.ensureHeroDirAndAssets();
  }

  private async ensureHeroDirAndAssets() {
    const fs = require('fs');
    const path = require('path');
    const frontendAssetsDir = 'c:/himsworkingcode/hims/frontend/app/src/assets';
    const backendUploadsDir = path.join(process.cwd(), 'uploads', 'hero');

    try {
      if (!fs.existsSync(backendUploadsDir)) {
        console.log(`[HeroSection] Creating directory: ${backendUploadsDir}`);
        fs.mkdirSync(backendUploadsDir, { recursive: true });
      }

      const imagesToCopy = [
        { src: 'herosection1.png', dest: 'hero-1.png' },
        { src: 'herosection2.png', dest: 'hero-2.png' },
        { src: 'herosection3.png', dest: 'hero-3.png' },
      ];

      for (const img of imagesToCopy) {
        const srcPath = path.join(frontendAssetsDir, img.src);
        const destPath = path.join(backendUploadsDir, img.dest);
        
        if (fs.existsSync(srcPath)) {
          if (!fs.existsSync(destPath)) {
            console.log(`[HeroSection] Copying ${img.src} to ${destPath}...`);
            fs.copyFileSync(srcPath, destPath);
          }
        } else {
          console.warn(`[HeroSection] Source image not found: ${srcPath}`);
        }
      }
    } catch (err) {
      console.error('[HeroSection] Error ensuring directory/assets:', err.message);
    }
  }

  async findAll(): Promise<HeroSection[]> {
    return this.heroSectionRepository.find({
      order: {
        order: 'ASC',
      },
    });
  }

  async findActive(): Promise<HeroSection[]> {
    return this.heroSectionRepository.find({
      where: { status: 'active' },
      order: {
        order: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<HeroSection> {
    const heroSection = await this.heroSectionRepository.findOne({ where: { id } });
    if (!heroSection) {
      throw new NotFoundException(`Hero section with ID ${id} not found`);
    }
    return heroSection;
  }

  async create(createHeroSectionDto: Partial<HeroSection>): Promise<HeroSection> {
    const heroSection = this.heroSectionRepository.create(createHeroSectionDto);
    return this.heroSectionRepository.save(heroSection);
  }

  async update(id: number, updateHeroSectionDto: any): Promise<HeroSection> {
    const heroSection = await this.findOne(id);
    this.heroSectionRepository.merge(heroSection, updateHeroSectionDto);
    return this.heroSectionRepository.save(heroSection);
  }

  async remove(id: number): Promise<void> {
    const heroSection = await this.findOne(id);
    await this.heroSectionRepository.remove(heroSection);
  }

  async seedInitialData(): Promise<void> {
    const count = await this.heroSectionRepository.count();
    if (count > 0) return;

    const fs = require('fs');
    const path = require('path');
    const frontendAssetsDir = 'c:/himsworkingcode/hims/frontend/app/src/assets';
    const backendUploadsDir = './uploads/hero';

    if (!fs.existsSync(backendUploadsDir)) {
      fs.mkdirSync(backendUploadsDir, { recursive: true });
    }

    const initialSlides = [
      {
        title: 'HEALING YOU AS A WHOLE, NOT JUST THE DISEASE',
        subtitle: '30-minute expert case-taking and personalised treatments for you and your family.',
        image_url: '/uploads/hero/hero-1.png',
        source_image: 'herosection1.png',
        button_text: 'Book an Appointment',
        status: 'active',
        order: 1,
      },
      {
        title: 'HOMEOPATHY FOR YOU AND YOUR ENTIRE FAMILY',
        subtitle: 'We listen, we understand, and we offer precise, holistic care for every health need.',
        image_url: '/uploads/hero/hero-2.png',
        source_image: 'herosection2.png',
        button_text: 'Book an Appointment',
        status: 'active',
        order: 2,
      },
      {
        title: 'HOMEOPATHY THAT TRULY UNDERSTANDS YOU',
        subtitle: 'Compassionate care, detailed case analysis, and holistic healing with no side effects.',
        image_url: '/uploads/hero/hero-3.png',
        source_image: 'herosection3.png',
        button_text: 'Book an Appointment',
        status: 'active',
        order: 3,
      },
    ];

    for (const slide of initialSlides) {
      const { source_image, ...slideData } = slide;
      
      // Copy physical file if it exists in frontend
      const srcPath = path.join(frontendAssetsDir, source_image);
      const destPath = path.join(backendUploadsDir, `hero-${initialSlides.indexOf(slide) + 1}.png`);
      
      try {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      } catch (err) {
        console.error(`Failed to copy seed image ${source_image}:`, err.message);
      }

      await this.create(slideData);
    }
  }
}
