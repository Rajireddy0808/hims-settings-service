import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Blog } from '../entities/blog.entity';

@Injectable()
export class BlogsService implements OnModuleInit {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>,
  ) {}

  async onModuleInit() {
    console.log('🚀 Checking and updating Blog database schema...');
    try {
      // 1. Add slug column if it doesn't exist
      await this.blogsRepository.query(`
        ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "slug" varchar(500);
      `);
      
      // 2. Add short_description column if it doesn't exist
      await this.blogsRepository.query(`
        ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "short_description" text;
      `);
      
      // 3. Add long_description column if it doesn't exist
      await this.blogsRepository.query(`
        ALTER TABLE "blogs" ADD COLUMN IF NOT EXISTS "long_description" text;
      `);

      // 4. Migrate data from excerpt to short_description if new column is empty
      await this.blogsRepository.query(`
        UPDATE "blogs" SET "short_description" = "excerpt" 
        WHERE "short_description" IS NULL AND "excerpt" IS NOT NULL;
      `);

      // 5. Migrate data from content to long_description if new column is empty
      await this.blogsRepository.query(`
        UPDATE "blogs" SET "long_description" = "content" 
        WHERE "long_description" IS NULL AND "content" IS NOT NULL;
      `);

      // 6. Self-healing: Convert plain text newlines to HTML paragraphs for existing blogs
      const allBlogs = await this.blogsRepository.find();
      for (const b of allBlogs) {
        if (b.long_description && !b.long_description.includes('<p>') && b.long_description.includes('\n')) {
          const htmlContent = b.long_description
            .split('\n')
            .filter(para => para.trim().length > 0)
            .map(para => `<p>${para.trim()}</p>`)
            .join('\n');
          await this.blogsRepository.update(b.id, { long_description: htmlContent });
        }
      }

      // 7. Ensure slugs are populated
      const results = await this.blogsRepository.query('SELECT id, title FROM "blogs" WHERE "slug" IS NULL');
      for (const row of results) {
        const slug = this.slugify(row.title);
        await this.blogsRepository.query('UPDATE "blogs" SET "slug" = $1 WHERE id = $2', [slug, row.id]);
      }

      console.log('✅ Blog database schema update completed successfully.');
    } catch (error) {
      console.warn('⚠️ Note: Database schema update encountered an issue (possibly columns already exist or excerpt/content renamed):', error.message);
    }
  }

  private slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findByTitle(slug: string): Promise<Blog> {
    const blog = await this.blogsRepository.findOne({
      where: {
        slug: slug,
        status: 'active'
      }
    });

    if (!blog) {
      throw new NotFoundException(`Blog with slug "${slug}" not found`);
    }
    return blog;
  }

  async create(createBlogDto: any): Promise<Blog> {
    const blog = this.blogsRepository.create({
      ...createBlogDto,
      slug: createBlogDto.slug || this.slugify(createBlogDto.title)
    });
    return await this.blogsRepository.save(blog) as any;
  }

  async findAll(): Promise<Blog[]> {
    return await this.blogsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllActive(limit?: number, offset?: number): Promise<Blog[]> {
    return await this.blogsRepository.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogsRepository.findOne({ where: { id } });
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return blog;
  }

  async update(id: number, updateBlogDto: any): Promise<Blog> {
    const blog = await this.findOne(id);
    if (updateBlogDto.title && updateBlogDto.title !== blog.title) {
      updateBlogDto.slug = this.slugify(updateBlogDto.title);
    }
    Object.assign(blog, updateBlogDto);
    return await this.blogsRepository.save(blog) as any;
  }

  async remove(id: number): Promise<void> {
    const blog = await this.findOne(id);
    await this.blogsRepository.remove(blog);
  }

  async seed(): Promise<void> {
    // 1. Populate slugs for existing blogs that don't have one
    const allBlogs = await this.findAll();
    for (const blog of allBlogs) {
      if (!blog.slug) {
        blog.slug = this.slugify(blog.title);
        await this.blogsRepository.save(blog);
      }
    }

    // 2. Add initial data if it doesn't exist
    const initialBlogs = [
      {
        title: "Homeopathy Treatment for Tuberculosis: A Comprehensive Supportive Approach",
        short_description: "Tuberculosis (TB) is a serious but treatable infectious disease that continues to affect millions worldwide. While conventional medicine is the primary route, homeopathy offers a vital supportive role in boosting immunity and managing side effects.",
        long_description: `
          <h2>Understanding Tuberculosis & Its Impact</h2>
          <p>Tuberculosis is an infectious disease caused by the <strong>Mycobacterium tuberculosis</strong> bacterium. It primarily affects the lungs but can also impact other parts of the body. Despite modern advancements, TB remains a global health challenge requiring disciplined treatment and holistic support.</p>
          
          <h2>The Role of Homeopathy in TB Management</h2>
          <p>Homeopathy does not replace conventional anti-TB treatment (DOTS). Instead, it works as a <strong>powerful supportive therapy</strong>. The goal is to strengthen the patient's internal defense mechanism, improve appetite, and help the body better tolerate the intensive medication required for recovery.</p>
          
          <h2>Key Benefits of Supportive Homeopathic Care</h2>
          <ul>
            <li><strong>Boosting Immunity:</strong> Natural remedies help the body recognize and fight infections more effectively.</li>
            <li><strong>Managing Medication Side Effects:</strong> Anti-TB drugs can be taxing on the liver and digestive system. Homeopathy helps alleviate nausea and fatigue.</li>
            <li><strong>Accelerating Recovery:</strong> By focusing on the overall constitution of the patient, homeopathy helps in faster weight gain and energy restoration.</li>
          </ul>

          <h2>A Holistic Path Forward</h2>
          <p>At Dr. Care Homeopathy, we provide personalized treatment plans that consider the physical, mental, and emotional well-being of the patient. Recovery from TB is a marathon, not a sprint, and having a balanced immune system makes all the difference.</p>
        `,
        image_url: "https://drcarehomeopathy.com/wp-content/uploads/2026/03/Homeopathy-Treatment-for-Tuberculosis-A-Comprehensive-Supportive-Approach.webp",
        status: "active"
      },
      {
        title: "Homeopathy for Kidney Stones: A Natural Path to Relief and Prevention",
        short_description: "Dealing with the sharp, stabbing pain of a kidney stone can be an overwhelming experience...",
        long_description: "Detailed content about kidney stones and homeopathy...",
        image_url: "https://drcarehomeopathy.com/wp-content/uploads/2026/01/Kindey-Stones.jpeg",
        status: "active"
      },
      {
        title: "Brain Tumors: Causes, Symptoms and Homeopathy Treatment",
        short_description: "Understanding brain tumors and how holistic homeopathy treatment can support recovery and well-being...",
        long_description: "Detailed content about brain tumors and homeopathy...",
        image_url: "https://drcarehomeopathy.com/wp-content/uploads/2026/03/Artboard-18-3.png",
        status: "active"
      }
    ];

    for (const b of initialBlogs) {
      const exists = await this.blogsRepository.findOne({ where: { title: b.title } });
      if (!exists) {
        await this.create(b);
      }
    }
  }
}
