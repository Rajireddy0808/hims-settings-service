import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGoogleReviewsTable1712750000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "google_reviews" (
                "id" SERIAL PRIMARY KEY,
                "branch_name" varchar(100) NOT NULL,
                "reviewer_name" varchar(200) NOT NULL,
                "reviewer_stats" varchar(150),
                "review_text" text NOT NULL,
                "review_date" varchar(100),
                "rating" integer NOT NULL DEFAULT 5,
                "status" varchar(20) NOT NULL DEFAULT 'active',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "google_reviews"`);
    }
}
