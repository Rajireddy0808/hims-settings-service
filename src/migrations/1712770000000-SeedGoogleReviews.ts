import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedGoogleReviews1712770000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "google_reviews" (branch_name, reviewer_name, reviewer_stats, review_text, review_date, rating, status) VALUES
            -- Miryalaguda
            ('Miryalaguda', 'Kommu Aruna', 'Local Guide', 'Excellent treatment for skin problem psoriasis, i am happy with the treatment. Friendly staff and good hospital. Thank you UniCare homeopathy.', '6 months ago', 5, 'active'),
            ('Miryalaguda', 'Sandy Gokatoti', '1 review', 'Very good service meds courier service is very fast. I''m taking treatment for thyroid since 6 months my values r normal now. Doctors r also very good.', '6 months ago', 5, 'active'),
            ('Miryalaguda', 'Sravani Sravani', '1 review', 'Best homeopathy clinic in Miryalaguda... thyroid problem saw significant improvement. I recommend to all.', '3 months ago', 5, 'active'),
            ('Miryalaguda', 'MD Janipasha', '1 review', 'Knee pains better now thank you UniCare homeopathy and staff receiving and service good.', '5 months ago', 5, 'active'),
            ('Miryalaguda', 'Anusha Lucky', '1 review', 'I am using treatment for gastric problems from 2 months now i feel better from gas problem.', '5 months ago', 5, 'active'),
            ('Miryalaguda', 'Gundla Vinod', '5 reviews', 'I had a great experience, treatment for my skin allergy was very effective. Strongly recommend.', '2 months ago', 5, 'active'),
            ('Miryalaguda', 'Niharika', '2 reviews', 'Staff was super friendly, which made me feel comfortable throughout my treatment.', '4 months ago', 5, 'active'),
            ('Miryalaguda', 'Sai Krishna', '1 review', 'Best results for gastric issues. I am very happy now after treatment.', '1 month ago', 5, 'active'),
            ('Miryalaguda', 'Ramesh P', 'Local Guide', 'Very professional doctors and helpful staff. Treatment for migraine was successful.', '3 months ago', 5, 'active'),
            ('Miryalaguda', 'Latha M', '3 reviews', 'Psoriasis treatment is very effective at UniCare Miryalaguda. Doctor gave great care.', '5 months ago', 5, 'active'),

            -- Narasaraopet
            ('Narasaraopet', 'Manikanta Pulipati', '1 review', 'Best results in homeopathy treatment. Staff is very caring and receiving is also good.', '4 months ago', 5, 'active'),
            ('Narasaraopet', 'Chinni Venkata Sravani', '3 reviews', 'Best hospital for skin problem. Finally happy with the results after years of suffering.', '1 month ago', 5, 'active'),
            ('Narasaraopet', 'Sudha Sudha', 'Local Guide', 'Good treatment for gastric problem. Doctor is very experienced. Very happy with service.', '2 months ago', 5, 'active'),
            ('Narasaraopet', 'Ramavat Ashok Kumar', '5 reviews', 'Suffering from severe knee pain. Within a few months, health improved. Thank you UniCare.', '3 months ago', 5, 'active'),
            ('Narasaraopet', 'Sairam Sairam', '1 review', 'Very good treatment for back pain. Much satisfied. Best homeopathy in Narasaraopet.', '5 months ago', 5, 'active'),
            ('Narasaraopet', 'Venkatesh K', '2 reviews', 'My thyroid values are normal now after 6 months of treatment. Great care from doctors.', '2 months ago', 5, 'active'),
            ('Narasaraopet', 'Radha G', 'Local Guide', 'Highly recommended for permanent relief from chronic issues. Best homeopathy here.', '4 months ago', 5, 'active'),
            ('Narasaraopet', 'Anil M', '1 review', 'Excellent treatment for diabetes management through homeopathy. Very satisfied results.', '1 month ago', 5, 'active'),
            ('Narasaraopet', 'Kavitha R', '3 reviews', 'Hair fall problem solved completely. Doctor advice was very helpful and medicines worked.', '6 months ago', 5, 'active'),
            ('Narasaraopet', 'Prasad T', 'Local Guide', 'Good treatment for migraine. Finally got relief after visiting many hospitals before this.', '3 months ago', 5, 'active'),

            -- Ongole
            ('Ongole', 'Dasari Rajasekhar babu', 'Local Guide · 25 reviews', 'Very good service, meds courier service is very fast. I''m taking treatment for thyroid and values are normal now. Best in Ongole.', '3 months ago', 5, 'active'),
            ('Ongole', 'Suvartha Kolakaluri', '1 review', 'Free from migraine, best decision today here. Very gentle treatment with great results.', '2 months ago', 5, 'active'),
            ('Ongole', 'Sameera Sam', '3 reviews', 'Treatment for joint pains is really good. Doctor is very dedicated to patient care.', '1 month ago', 5, 'active'),
            ('Ongole', 'Sravani Sanaka', 'Local Guide', 'Best hospital for skin allergy. Finally got results here after visiting many clinics before.', '4 months ago', 5, 'active'),
            ('Ongole', 'Sudha Rani', '5 reviews', 'Excellent treatment for Gastric problem. Fine now after 2 years of suffering. Worth every penny.', '6 months ago', 5, 'active'),
            ('Ongole', 'Kiran Dev', '1 review', 'Found real relief for my PCOD issues here. Ongole branch is top tier in service.', '5 months ago', 5, 'active'),
            ('Ongole', 'Madhu B', 'Local Guide', 'UniCare team is very professional. Courier service works perfectly for medicine delivery.', '3 months ago', 5, 'active'),
            ('Ongole', 'Aruna S', '2 reviews', 'Thyroid treatment is very effective. Doctor gave clear guidance and medicines on time.', '2 months ago', 5, 'active'),
            ('Ongole', 'Praveen R', '1 review', 'Sinus and allergy problem resolved completely. Very good homeopathic treatment.', '7 months ago', 5, 'active'),
            ('Ongole', 'Jyothi P', '3 reviews', 'Hair fall treatment worked very well. Significant improvement within 3 months.', '4 months ago', 5, 'active');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "google_reviews"`);
    }
}
