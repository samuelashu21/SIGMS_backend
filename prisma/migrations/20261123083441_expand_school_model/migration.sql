/*
  Warnings:

  - A unique constraint covering the columns `[school_code]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `school_code` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_type` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "school_types" AS ENUM ('ELEMENTARY', 'SECONDARY', 'PREPARATORY', 'COMBINED');

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "school_code" TEXT NOT NULL,
ADD COLUMN     "school_type" "school_types" NOT NULL,
ADD COLUMN     "woreda" TEXT,
ADD COLUMN     "zone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "schools_school_code_key" ON "schools"("school_code");

-- CreateIndex
CREATE INDEX "schools_school_type_idx" ON "schools"("school_type");

-- CreateIndex
CREATE INDEX "schools_region_zone_idx" ON "schools"("region", "zone");
