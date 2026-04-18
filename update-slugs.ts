import { createConnection, getRepository } from 'typeorm';
import { Treatment } from './src/entities/treatment.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function updateSlugs() {
  try {
    const connection = await createConnection();
    const treatmentRepository = getRepository(Treatment);
    const treatments = await treatmentRepository.find();

    for (const treatment of treatments) {
      if (!treatment.slug) {
        treatment.slug = treatment.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        await treatmentRepository.save(treatment);
        console.log(`Updated slug for ${treatment.name} -> ${treatment.slug}`);
      }
    }

    await connection.close();
    console.log('Finished updating slugs.');
  } catch (error) {
    console.error('Error updating slugs:', error);
  }
}

updateSlugs();
