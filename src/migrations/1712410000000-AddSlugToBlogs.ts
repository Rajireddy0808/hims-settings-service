import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugToBlogs1712410000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add slug column as nullable first
        await queryRunner.query(`ALTER TABLE "blogs" ADD "slug" character varying(500)`);
        
        // 2. Populate slugs for existing records
        const blogs = await queryRunner.query(`SELECT id, title FROM "blogs"`);
        for (const blog of blogs) {
            const slug = blog.title
                .toString()
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            
            // Handle potential duplicates by appending ID if needed
            await queryRunner.query(`UPDATE "blogs" SET "slug" = $1 WHERE id = $2`, [slug, blog.id]);
        }

        // 3. Make slug column unique
        await queryRunner.query(`ALTER TABLE "blogs" ADD CONSTRAINT "UQ_blogs_slug" UNIQUE ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP CONSTRAINT "UQ_blogs_slug"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "slug"`);
    }
}
