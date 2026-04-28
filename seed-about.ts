import { createConnection, getRepository } from 'typeorm';
import { AboutContent } from './src/entities/about-content.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedAbout() {
  try {
    const connection = await createConnection();
    const aboutRepository = getRepository(AboutContent);
    
    // Check if content already exists
    const count = await aboutRepository.count();
    
    if (count === 0) {
      const initialAbout = aboutRepository.create({
        title: "The Natural science\nWHAT IS HOMEOPATHY?",
        description: "Homeopathy is an alternative healthcare system acknowledged by many global health communities. It originated in Germany and is now widely practiced and respected in India. Homeopathy offers safe, natural treatment for many chronic conditions, with virtually no side effects. It works by strengthening the body's immune system and helping to develop resilience to fight long-term health issues.\n\nUniCare Group has 4 branches and over 30 qualified doctors. We follow an evidence-based homeopathic practice that considers both mental and physical health. Our treatments are cost-effective, provide rapid relief, and are centered around patient care.",
        status: "active"
      });
      
      await aboutRepository.save(initialAbout);
      console.log('✅ Initial About content seeded successfully.');
    } else {
      console.log('ℹ️ About content already exists, skipping seed.');
    }

    await connection.close();
  } catch (error) {
    console.error('❌ Error seeding About content:', error);
  }
}

seedAbout();
