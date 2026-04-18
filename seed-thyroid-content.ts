import { DataSource } from 'typeorm';
import { Treatment } from './src/entities/treatment.entity';

async function seedThyroid() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: '12345',
    database: 'postgres',
    entities: [Treatment],
    synchronize: false,
  });

  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    const treatmentRepo = AppDataSource.getRepository(Treatment);
    
    // Find Thyroid Disorders treatment
    const thyroid = await treatmentRepo.findOne({ where: { name: 'Thyroid Disorders' } });
    
    if (thyroid) {
      thyroid.long_description = "Thyroid disorders affect the thyroid gland, a butterfly-shaped gland in the front of the neck. The thyroid has important roles to regulate numerous metabolic processes throughout the body. At Unicare Homeopathy, we provide constitutional treatment that targets the root cause of hormonal imbalance.";
      
      thyroid.sections = [
        {
          title: "Homeopathy Treatment For Thyroid Disorder",
          type: "text",
          content: "Thyroid disorders are a common health concern that impacts the metabolic rate of the body. Homeopathy offers a safe and effective alternative to conventional hormone replacement therapy. By focusing on the individual's unique physical and emotional makeup, constitutional homeopathy stimulates the body's self-healing mechanism to regulate thyroid function naturally."
        },
        {
          title: "Symptoms & Indicators",
          type: "list",
          content: "Hyperthyroidism: Rapid heartbeat, unexplained weight loss, increased appetite, nervousness, and tremors. Hypothyroidism: Persistent fatigue, weight gain, cold sensitivity, constipation, dry skin, and muscle weakness. Each patient's symptom profile is carefully analyzed to determine the best remedy."
        },
        {
          title: "The Unicare Genetic Approach",
          type: "text",
          content: "Our specialized treatment goes beyond symptom management. We delve deep into the genetic and environmental factors that trigger thyroid dysfunction. This tailored approach ensures that the immune system is balanced, helping the thyroid gland function at its optimum without the need for lifelong medication in many cases."
        }
      ];

      thyroid.faqs = [
        {
           question: "Will I have to take homeopathy for the rest of my life?",
           answer: "No. Unlike conventional hormone replacement, homeopathic treatment aims to correct the underlying imbalance. Once the thyroid function is stabilized and the body is balanced, treatment can often be tapered off."
        },
        {
           question: "Can I take homeopathy alongside my current thyroid medication?",
           answer: "Yes, homeopathy is safe to use alongside conventional treatments. Many of our patients start homeopathic care while on their current pills and gradually reduce them under medical supervision as their health improves."
        },
        {
           question: "Is there any specific diet to follow?",
           answer: "We provide personalized nutritional guidance, such as avoiding goitrogenic foods for some or ensuring adequate iodine intake for others, to complement your treatment."
        }
      ];

      await treatmentRepo.save(thyroid);
      console.log('✅ Thyroid Disorders treatment seeded with full content!');
    } else {
      console.log('❌ Thyroid Disorders treatment not found in database.');
    }

  } catch (error) {
    console.error('Error seeding thyroid:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedThyroid();
