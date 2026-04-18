import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';

@Injectable()
export class BranchesService implements OnModuleInit {
  constructor(
    @InjectRepository(Branch)
    private branchesRepository: Repository<Branch>,
  ) {}

  async onModuleInit() {
    console.log('[Branches] 🚀 Initializing Branch Service...');
    try {
      // Always run seed to ensure new branches are added
      await this.seed();
      console.log('[Branches] Initialization completed.');
    } catch (error) {
      console.error('[Branches] ❌ Initialization failed.');
      console.warn('[Branches] Details:', error.message);
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

  async findAll(): Promise<Branch[]> {
    return await this.branchesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findAllActive(): Promise<Branch[]> {
    return await this.branchesRepository.find({
      where: { status: 'active' },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({ where: { id } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async findBySlug(slug: string): Promise<Branch> {
    const branch = await this.branchesRepository.findOne({ 
      where: { 
        slug: slug,
        status: 'active'
      } 
    });
    if (!branch) {
      throw new NotFoundException(`Branch with slug "${slug}" not found`);
    }
    return branch;
  }

  async create(createBranchDto: any): Promise<Branch> {
    const branch = this.branchesRepository.create(createBranchDto as Partial<Branch>);
    if (!branch.slug) {
      branch.slug = this.slugify(branch.name);
    }
    return await this.branchesRepository.save(branch);
  }

  async update(id: number, updateBranchDto: any): Promise<Branch> {
    const branch = await this.findOne(id);
    if (updateBranchDto.name && updateBranchDto.name !== branch.name) {
      updateBranchDto.slug = updateBranchDto.slug || this.slugify(updateBranchDto.name);
    }
    Object.assign(branch, updateBranchDto);
    return await this.branchesRepository.save(branch);
  }

  async remove(id: number): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchesRepository.remove(branch);
  }

  async seed(): Promise<void> {
    const initialBranches = [
      {
        name: "Narasaraopet Central",
        slug: "narasaraopet",
        address: "UniCare Homeopathy, Main Road, Near Gandhi Statue, Narasaraopet, AP 522601",
        phone: "+91 95533 87472, +08647-223344",
        email: "nrt@unicarehomeopathy.com",
        description: `
          <div class="clinical-overview">
            <h3 class="text-2xl font-serif font-bold text-[#1a2e5a] mb-4">World Class Homeopathic Care in Narasaraopet</h3>
            <p class="mb-4">Our Narasaraopet branch stands as a beacon of hope for thousands of patients seeking permanent relief from chronic ailments. Equipped with advanced diagnostic tools and led by senior practitioners with decades of constitutional homeopathic expertise.</p>
            <p class="mb-4">We specialize in treating complex disorders including:</p>
            <ul class="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Chronic Skin Conditions:</strong> Psoriasis, Eczema, and Vitiligo.</li>
              <li><strong>Respiratory Health:</strong> Asthma, Allergic Rhinitis, and Sinusitis.</li>
              <li><strong>Lifestyle Disorders:</strong> Thyroid imbalances, Diabetes complications, and Hypertension.</li>
              <li><strong>Hair Care:</strong> Alopecia Areata and chronic Hair Loss.</li>
            </ul>
            <p>At UniCare Narasaraopet, we don't just treat the disease; we treat the person behind the disease.</p>
          </div>
        `,
        map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15313.253046205842!2d80.05!3d16.23!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4a61356a84f509%3A0xc6226d7e62a4d048!2sNarasaraopet%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1712570000000!5m2!1sen!2sin",
        image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1629909613654-2871b7c46f61?q=80&w=800",
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800",
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800",
          "https://images.unsplash.com/photo-1504813184591-01592fd03cfd?q=80&w=800"
        ],
        timings: "10:00 AM - 08:00 PM (Mon - Sat), 10:00 AM - 02:00 PM (Sun)",
        landmarks: ["Near Gandhi Statue", "Above Union Bank", "Opposite RTC Bus Stand"],
        state: "Andhra Pradesh",
        status: "active"
      },
      {
        name: "Ongole Clinic",
        slug: "ongole",
        address: "Trunk Road, Near District Court, Ongole, Andhra Pradesh 523001",
        phone: "+91 95533 87475",
        email: "ongole@unicarehomeopathy.com",
        description: `
          <div class="clinical-overview">
            <h3 class="text-2xl font-serif font-bold text-[#1a2e5a] mb-4">Patient-Centric Excellence in Ongole</h3>
            <p class="mb-4">Our Ongole facility is designed to provide a serene and healing environment. We combine legacy homeopathic wisdom with modern evidence-based diagnostic standards to offer safe, side-effect-free treatments.</p>
            <div class="bg-blue-50 p-6 rounded-2xl mb-4">
               <h4 class="font-bold text-[#1a2e5a] mb-2">Branch Features:</h4>
               <ul class="grid grid-cols-2 gap-2 text-sm">
                  <li>In-house Lab Tests</li>
                  <li>Online Consultation</li>
                  <li>Constitutional Meds</li>
                  <li>Child Care Experts</li>
               </ul>
            </div>
          </div>
        `,
        map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61536.03977543!2d80.01!3d15.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4b005118f67331%3A0xc07a82772e0a69a4!2sOngole%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1712570000000!5m2!1sen!2sin",
        image_url: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=2000&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1504813184591-01592fd03cfd?q=80&w=800",
          "https://images.unsplash.com/photo-15194941402682-1dd2d69f0692?q=80&w=800"
        ],
        timings: "09:30 AM - 08:30 PM (Mon - Sat)",
        landmarks: ["Near Court Center", "Above Axis Bank", "Prakasam Bhavan Road"],
        state: "Andhra Pradesh",
        status: "active"
      },
      {
        name: "Miryalaguda Telangana",
        slug: "miryalaguda",
        address: "UniCare Homeopathy, Main Road, Near RTC Bus Stand, Miryalaguda, Telangana 508207",
        phone: "+91 95533 87476",
        email: "miryalaguda@unicarehomeopathy.com",
        description: `
          <div class="clinical-overview">
            <h3 class="text-2xl font-serif font-bold text-[#1a2e5a] mb-4">Advanced Homeopathy in Miryalaguda</h3>
            <p class="mb-4">Our Miryalaguda branch brings world-class homeopathic treatments to the heart of Telangana. We focus on constitutional therapy to provide long-term relief from chronic conditions.</p>
            <div class="bg-blue-50 p-6 rounded-2xl mb-4">
               <h4 class="font-bold text-[#1a2e5a] mb-2">Our Specialties:</h4>
               <ul class="grid grid-cols-2 gap-2 text-sm">
                  <li>Arthritis & Pain Mgmt</li>
                  <li>Respiratory Allergies</li>
                  <li>Skin & Hair Disorders</li>
                  <li>Pediatric Care</li>
               </ul>
            </div>
          </div>
        `,
        map_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15254.464670231!2d79.56!3d17.13!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae07119ff3a097%3A0xc3f587d5537550f2!2sMiryalaguda%2C%20Telangana!5e0!3m2!1sen!2sin!4v1712570000000!5m2!1sen!2sin",
        image_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2000&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800",
          "https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=800"
        ],
        timings: "10:00 AM - 08:00 PM (Mon - Sat)",
        landmarks: ["Near RTC Bus Stand", "Opposite Hanuman Temple"],
        state: "Telangana",
        status: "active"
      }
    ];

    for (const b of initialBranches) {
      const existing = await this.branchesRepository.findOne({ where: { slug: b.slug } });
      if (existing) {
        // Update existing branch to match seed data (dynamic update)
        console.log(`[Branches] Updating existing branch: ${b.name}`);
        await this.branchesRepository.update(existing.id, b as any);
      } else {
        // Create new branch
        console.log(`[Branches] Creating new branch: ${b.name}`);
        await this.create(b);
      }
    }
  }
}
