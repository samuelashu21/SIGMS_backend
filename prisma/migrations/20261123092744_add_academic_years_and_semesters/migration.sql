-- CreateEnum
CREATE TYPE "academic_year_statuses" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "semester_statuses" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "school_configurations" ADD COLUMN     "academic_year_start_month" INTEGER NOT NULL DEFAULT 9,
ADD COLUMN     "allow_parent_result_access" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allow_student_result_access" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "attendance_cutoff_time" TEXT NOT NULL DEFAULT '08:30',
ADD COLUMN     "require_marks_approval" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "week_starts_on" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "academic_years" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "academic_year_statuses" NOT NULL DEFAULT 'PLANNED',
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "semester_statuses" NOT NULL DEFAULT 'PLANNED',
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_years_school_status_idx" ON "academic_years"("school_id", "status");

-- CreateIndex
CREATE INDEX "academic_years_school_current_idx" ON "academic_years"("school_id", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_id_school_key" ON "academic_years"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_school_name_key" ON "academic_years"("school_id", "name");

-- CreateIndex
CREATE INDEX "semesters_school_status_idx" ON "semesters"("school_id", "status");

-- CreateIndex
CREATE INDEX "semesters_school_year_idx" ON "semesters"("school_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_year_name_key" ON "semesters"("academic_year_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_year_sequence_key" ON "semesters"("academic_year_id", "sequence");

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
