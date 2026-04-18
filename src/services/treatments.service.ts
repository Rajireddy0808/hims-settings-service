import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Treatment } from '../entities/treatment.entity';

@Injectable()
export class TreatmentsService implements OnModuleInit {
  constructor(
    @InjectRepository(Treatment)
    private readonly treatmentRepository: Repository<Treatment>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    console.log('[Treatments] 🚀 Initializing Treatment Service...');
    try {
      await this.fixDb();
      await this.seed();
    } catch (err) {
      console.error('[Treatments] Error during initialization:', err);
    }
  }

  async fixDb(): Promise<string> {
    const results = [];
    try {
      // Step 1: Add column
      try {
        await this.dataSource.query('ALTER TABLE "treatments" ADD COLUMN IF NOT EXISTS "slug" VARCHAR(255) UNIQUE');
        results.push('Column "slug" ensured in "treatments" table.');
      } catch (err) {
        results.push(`Error adding column: ${err.message}`);
      }

      // Step 2: Populate slugs
      try {
        await this.dataSource.query(`
          UPDATE "treatments" 
          SET "slug" = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
          WHERE "slug" IS NULL
        `);
        results.push('Slugs populated for existing treatments.');
      } catch (err) {
        results.push(`Error populating slugs: ${err.message}`);
      }

      return results.join(' | ');
    } catch (error) {
      console.error('Critical error in fixDb:', error);
      return `Critical failure: ${error.message}`;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async create(createTreatmentDto: any): Promise<Treatment> {
    if (!createTreatmentDto.slug && createTreatmentDto.name) {
      createTreatmentDto.slug = this.generateSlug(createTreatmentDto.name);
    }
    const treatment = this.treatmentRepository.create(createTreatmentDto);
    return this.treatmentRepository.save(treatment) as any;
  }

  async findAll(): Promise<Treatment[]> {
    return this.treatmentRepository.find({ order: { name: 'ASC' } });
  }

  async findAllActive(): Promise<Treatment[]> {
    await this.fixDb();
    return this.treatmentRepository.find({
      where: { status: 'active' },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Treatment> {
    const treatment = await this.treatmentRepository.findOne({ where: { id } });
    if (!treatment) {
      throw new NotFoundException(`Treatment with ID ${id} not found`);
    }
    return treatment;
  }

  async findOneBySlug(slug: string): Promise<Treatment> {
    await this.fixDb();
    const treatment = await this.treatmentRepository.findOne({ where: { slug, status: 'active' } });
    if (!treatment) {
      throw new NotFoundException(`Treatment with slug ${slug} not found`);
    }
    return treatment;
  }

  async update(id: number, updateTreatmentDto: any): Promise<Treatment> {
    await this.findOne(id);
    if (updateTreatmentDto.name && !updateTreatmentDto.slug) {
      updateTreatmentDto.slug = this.generateSlug(updateTreatmentDto.name);
    }
    await this.treatmentRepository.update(id, updateTreatmentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const treatment = await this.findOne(id);
    await this.treatmentRepository.remove(treatment);
  }

  async seed(): Promise<void> {
    const count = await this.treatmentRepository.count();
    if (count > 0) return;

    const initialData = [
      {
        name: "Low Back Pain (Backache)",
        category: "Bone & Spine",
        short_description: "Comprehensive homeopathic treatment for chronic and acute low back pain, targeting the root cause naturally.",
        long_description: "Experience a natural way to heal your back. Our specialized homeopathic remedies target inflammation and strengthen spinal health without side effects.",
        image_url: "https://images.unsplash.com/photo-1588636746830-6784570076a9?q=80&w=2671&auto=format&fit=crop",
        status: "active",
        sections: [
          {
            title: "Understanding the Growing Problem of Low Back Pain",
            type: "text",
            content: "Low back pain is incredibly common, affecting people from all walks of life..."
          }
        ],
        faqs: [
          {
            question: "Can homeopathy provide long-term relief for back pain?",
            answer: "Yes, homeopathy can provide long-term relief by addressing the root cause..."
          }
        ]
      },
      {
        name: "Kidney Stones",
        category: "Renal Care",
        short_description: "Holistic homeopathic treatment for all stages of kidney stones, offering natural relief and prevention of recurrence.",
        long_description: "Gentle yet powerful treatment for kidney stones. Our remedies help in natural stone passage and prevent future occurrences.",
        image_url: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=80&w=2612&auto=format&fit=crop",
        status: "active",
        sections: [],
        faqs: []
      },
      {
        name: "Spondylitis",
        category: "Bone & Spine",
        short_description: "Lasting relief from spondylitis through personalized homeopathic care and inflammation management.",
        long_description: "Restore your mobility and find lasting relief from spinal stiffness. We focus on long-term spinal health.",
        image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2640&auto=format&fit=crop",
        status: "active",
        sections: [],
        faqs: []
      },
      {
        name: "Sinusitis",
        category: "Respiratory",
        short_description: "Heal sinusitis symptoms naturally and reduce recurring allergies with specialized homeopathic care.",
        long_description: "Breathe freely again. Our treatment addresses the root cause of your sinus issues.",
        image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2670&auto=format&fit=crop",
        status: "active",
        sections: [],
        faqs: []
      },
      {
        name: "Thyroid Disorders",
        category: "Hormonal",
        short_description: "Expert care for thyroid conditions using individualized homeopathic treatment plans for hormonal balance.",
        long_description: "Natural hormonal balance for your thyroid. We provide specialized care to regulate your gland's function.",
        image_url: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2670&auto=format&fit=crop",
        status: "active",
        sections: [],
        faqs: []
      },
      {
        name: "PCOS / PCOD",
        category: "Women's Health",
        slug: "pcos",
        short_description: "Specialized treatment for PCOS naturally, restoring hormonal balance and improving overall well-being.",
        long_description: "Empowering women's health through natural restoration. Our PCOS treatment focuses on regularizing cycles.",
        image_url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2574&auto=format&fit=crop",
        status: "active",
        sections: [
          {
            title: "PCOS Symptoms",
            type: "list",
            content: "Irregular periods,Excessive hair growth (hirsutism),Severe acne,Weight gain,Thinning hair"
          },
          {
            title: "PCOS Causes",
            type: "text",
            content: "Polycystic ovary syndrome (PCOS) is a hormonal disorder common among women of reproductive age. The exact cause of PCOS is unknown, but factors include insulin resistance, excess androgen, and genetics."
          },
          {
            title: "Homeopathic Treatment",
            type: "text",
            content: "Homeopathy offers a constitutional approach to treating PCOS. It focuses on identifying and correcting the underlying hormonal imbalances naturally, without side effects."
          }
        ],
        faqs: [
          {
            question: "Is PCOS curable with Homeopathy?",
            answer: "Yes, Homeopathy addresses the root cause of the hormonal imbalance and can effectively manage and often resolve PCOS symptoms permanently."
          },
          {
            question: "Does PCOS return after treatment?",
            answer: "With consistent treatment and lifestyle modifications recommended by our doctors, the chances of recurrence are significantly minimized."
          }
        ]
      }
    ];

    for (const data of initialData) {
      if (!data.slug) {
        (data as any).slug = this.generateSlug(data.name);
      }
      await this.treatmentRepository.save(this.treatmentRepository.create(data));
    }
  }
}
