/*
  Warnings:

  - A unique constraint covering the columns `[school_id,student_number]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "students" ADD COLUMN     "student_number" TEXT;

-- CreateTable
CREATE TABLE "student_id_sequences" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "last_number" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "student_id_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_enrollments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "enrollment_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_id_sequences_school_year_key" ON "student_id_sequences"("school_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "academic_enrollments_school_year_idx" ON "academic_enrollments"("school_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "academic_enrollments_school_student_idx" ON "academic_enrollments"("school_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_enrollments_student_year_key" ON "academic_enrollments"("student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_school_student_number_key" ON "students"("school_id", "student_number");

-- AddForeignKey
ALTER TABLE "student_id_sequences" ADD CONSTRAINT "student_id_sequences_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_id_sequences" ADD CONSTRAINT "student_id_sequences_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_enrollments" ADD CONSTRAINT "academic_enrollments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_enrollments" ADD CONSTRAINT "academic_enrollments_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_enrollments" ADD CONSTRAINT "academic_enrollments_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
