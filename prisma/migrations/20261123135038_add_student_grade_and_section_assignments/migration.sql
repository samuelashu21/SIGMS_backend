/*
  Warnings:

  - A unique constraint covering the columns `[id,school_id,grade_id,academic_year_id]` on the table `sections` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "academic_enrollments" ADD COLUMN     "grade_id" UUID,
ADD COLUMN     "section_id" UUID;

-- CreateIndex
CREATE INDEX "academic_enrollments_school_grade_idx" ON "academic_enrollments"("school_id", "grade_id");

-- CreateIndex
CREATE INDEX "academic_enrollments_school_section_idx" ON "academic_enrollments"("school_id", "section_id");

-- CreateIndex
CREATE UNIQUE INDEX "sections_id_school_grade_year_key" ON "sections"("id", "school_id", "grade_id", "academic_year_id");

-- AddForeignKey
ALTER TABLE "academic_enrollments" ADD CONSTRAINT "academic_enrollments_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_enrollments" ADD CONSTRAINT "academic_enrollments_section_id_school_id_grade_id_academi_fkey" FOREIGN KEY ("section_id", "school_id", "grade_id", "academic_year_id") REFERENCES "sections"("id", "school_id", "grade_id", "academic_year_id") ON DELETE RESTRICT ON UPDATE CASCADE;
