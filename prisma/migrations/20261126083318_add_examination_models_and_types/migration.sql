/*
  Warnings:

  - A unique constraint covering the columns `[id,school_id]` on the table `semesters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "examination_types" AS ENUM ('QUIZ', 'TEST', 'MIDTERM', 'FINAL', 'MOCK', 'NATIONAL', 'CONTINUOUS_ASSESSMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "examination_statuses" AS ENUM ('DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "examination_modes" AS ENUM ('WRITTEN', 'ORAL', 'PRACTICAL', 'ONLINE', 'MIXED');

-- CreateTable
CREATE TABLE "examinations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "semester_id" UUID,
    "grade_id" UUID NOT NULL,
    "section_id" UUID,
    "subject_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "examination_types" NOT NULL,
    "mode" "examination_modes" NOT NULL DEFAULT 'WRITTEN',
    "status" "examination_statuses" NOT NULL DEFAULT 'DRAFT',
    "total_marks" DECIMAL(8,2) NOT NULL,
    "passing_marks" DECIMAL(8,2),
    "weight" DECIMAL(5,2),
    "examination_date" DATE,
    "start_time" TIME(0),
    "end_time" TIME(0),
    "room" TEXT,
    "instructions" TEXT,
    "created_by_id" UUID NOT NULL,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "examinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examination_type_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "examination_type_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examinations_school_id_academic_year_id_status_idx" ON "examinations"("school_id", "academic_year_id", "status");

-- CreateIndex
CREATE INDEX "examinations_school_id_grade_id_subject_id_idx" ON "examinations"("school_id", "grade_id", "subject_id");

-- CreateIndex
CREATE INDEX "examinations_school_id_examination_date_idx" ON "examinations"("school_id", "examination_date");

-- CreateIndex
CREATE UNIQUE INDEX "examinations_id_school_key" ON "examinations"("id", "school_id");

-- CreateIndex
CREATE INDEX "examination_type_configurations_school_id_is_active_idx" ON "examination_type_configurations"("school_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "examination_type_configurations_school_code_key" ON "examination_type_configurations"("school_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "examination_type_configurations_id_school_key" ON "examination_type_configurations"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_id_school_key" ON "semesters"("id", "school_id");

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_subject_id_school_id_fkey" FOREIGN KEY ("subject_id", "school_id") REFERENCES "subjects"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_type_configurations" ADD CONSTRAINT "examination_type_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
