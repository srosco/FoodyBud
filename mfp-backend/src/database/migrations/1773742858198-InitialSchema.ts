import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1773742858198 implements MigrationInterface {
    name = 'InitialSchema1773742858198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "foods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "barcode" character varying, "source" character varying NOT NULL DEFAULT 'CUSTOM', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "calories" double precision NOT NULL, "proteins" double precision NOT NULL, "carbs" double precision NOT NULL, "fat" double precision NOT NULL, "fiber" double precision NOT NULL, "sugars" double precision NOT NULL, "saturated_fat" double precision NOT NULL, "salt" double precision NOT NULL, "vitamins" jsonb, "minerals" jsonb, "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, CONSTRAINT "PK_0cc83421325632f61fa27a52b59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recipe_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity_g" double precision NOT NULL, "recipeId" uuid, "food_id" uuid, CONSTRAINT "PK_daec78e42198e9c42e1fed60eec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recipes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "total_weight_g" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meal_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity_g" double precision NOT NULL, "mealId" uuid, "food_id" uuid, "recipe_id" uuid, CONSTRAINT "PK_1e2d1209132a6ae53837e349a60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "date" date NOT NULL, "meal_type" character varying NOT NULL, "user_id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e6f830ac9b463433b58ad6f1a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "calories" double precision NOT NULL DEFAULT '2000', "proteins" double precision NOT NULL DEFAULT '150', "carbs" double precision NOT NULL DEFAULT '250', "fat" double precision NOT NULL DEFAULT '65', "fiber" double precision NOT NULL DEFAULT '25', "sugars" double precision NOT NULL DEFAULT '50', "saturated_fat" double precision NOT NULL DEFAULT '20', "salt" double precision NOT NULL DEFAULT '6', CONSTRAINT "UQ_88b78010581f2d293699d064441" UNIQUE ("user_id"), CONSTRAINT "PK_26e17b251afab35580dff769223" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "date" date NOT NULL, "calories_burned" double precision NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "foods" ADD CONSTRAINT "FK_c09f752a4673a3a1f338aa017ef" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_items" ADD CONSTRAINT "FK_2c44770a9565be7ea9327b1a2ab" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_items" ADD CONSTRAINT "FK_e3ca6c6a98b8ec50fa5cd1a41a0" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipes" ADD CONSTRAINT "FK_67d98fd6ff56c4340a811402154" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_items" ADD CONSTRAINT "FK_3f6ef111eb47f12e88760243aa6" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_items" ADD CONSTRAINT "FK_9b47372fc798d7e31000902dc09" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meal_items" ADD CONSTRAINT "FK_933d825a777fea6da489002c633" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meals" ADD CONSTRAINT "FK_d89009b328c39e42964f8b3f95b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "goals" ADD CONSTRAINT "FK_88b78010581f2d293699d064441" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_b82f1d8368dd5305ae7e7e664c2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_b82f1d8368dd5305ae7e7e664c2"`);
        await queryRunner.query(`ALTER TABLE "goals" DROP CONSTRAINT "FK_88b78010581f2d293699d064441"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_d89009b328c39e42964f8b3f95b"`);
        await queryRunner.query(`ALTER TABLE "meal_items" DROP CONSTRAINT "FK_933d825a777fea6da489002c633"`);
        await queryRunner.query(`ALTER TABLE "meal_items" DROP CONSTRAINT "FK_9b47372fc798d7e31000902dc09"`);
        await queryRunner.query(`ALTER TABLE "meal_items" DROP CONSTRAINT "FK_3f6ef111eb47f12e88760243aa6"`);
        await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "FK_67d98fd6ff56c4340a811402154"`);
        await queryRunner.query(`ALTER TABLE "recipe_items" DROP CONSTRAINT "FK_e3ca6c6a98b8ec50fa5cd1a41a0"`);
        await queryRunner.query(`ALTER TABLE "recipe_items" DROP CONSTRAINT "FK_2c44770a9565be7ea9327b1a2ab"`);
        await queryRunner.query(`ALTER TABLE "foods" DROP CONSTRAINT "FK_c09f752a4673a3a1f338aa017ef"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TABLE "goals"`);
        await queryRunner.query(`DROP TABLE "meals"`);
        await queryRunner.query(`DROP TABLE "meal_items"`);
        await queryRunner.query(`DROP TABLE "recipes"`);
        await queryRunner.query(`DROP TABLE "recipe_items"`);
        await queryRunner.query(`DROP TABLE "foods"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
