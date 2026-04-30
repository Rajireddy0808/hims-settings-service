import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedNalgondaReviews1712780000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "google_reviews" ("reviewer_name", "reviewer_stats", "review_date", "review_text", "rating", "branch_name", "status")
            VALUES 
            ('Suresh Kumar', 'Local Guide · 15 reviews', '2 weeks ago', 'Excellent treatment for chronic migraine. The staff at Nalgonda branch are very professional.', 5, 'Nalgonda', 'active'),
            ('Anita Reddy', '4 reviews', '1 month ago', 'Very happy with the results for my childs recurring cold and cough. Highly recommended.', 5, 'Nalgonda', 'active'),
            ('Venkatesh Rao', 'Local Guide · 42 reviews', '3 months ago', 'Best homeopathic clinic in Nalgonda. Clean environment and effective medicine.', 5, 'Nalgonda', 'active'),
            ('Lakshmi Devi', '2 reviews', 'recently', 'Suffering from thyroid issues for years, finally found relief here. Thank you Dr. Ashraf.', 5, 'Nalgonda', 'active'),
            ('Ramesh Babu', 'Local Guide', '5 months ago', 'Professional approach and genuine care. My gastric issues are much better now.', 4, 'Nalgonda', 'active'),
            ('Priyanka S', '10 reviews', '6 months ago', 'Skin allergy treatment was very effective. Results visible within a month.', 5, 'Nalgonda', 'active'),
            ('Mohan Lal', 'Local Guide · 8 reviews', '1 year ago', 'Very reasonable prices and excellent results for arthritis.', 5, 'Nalgonda', 'active'),
            ('Swapna K', '3 reviews', '8 months ago', 'Friendly doctors and good follow up. Recovered from PCOD naturally.', 5, 'Nalgonda', 'active'),
            ('Rajesh G', 'Local Guide · 25 reviews', '11 months ago', 'I was skeptical about homeopathy but UniCare proved me wrong. Great results for sinus.', 5, 'Nalgonda', 'active'),
            ('Divya T', '6 reviews', '2 years ago', 'The Nalgonda branch is easily accessible and very well maintained.', 4, 'Nalgonda', 'active');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "google_reviews" WHERE "branch_name" = 'Nalgonda'`);
    }
}
