-- CreateEnum
CREATE TYPE "admission_statuses" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "applicant_genders" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "admission_applications" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "application_number" TEXT NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "gender" "applicant_genders",
    "requested_grade_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "status" "admission_statuses" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "admission_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admission_applications_school_status_idx" ON "admission_applications"("school_id", "status");

-- CreateIndex
CREATE INDEX "admission_applications_school_year_idx" ON "admission_applications"("school_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "admission_applications_school_grade_idx" ON "admission_applications"("school_id", "requested_grade_id");

-- CreateIndex
CREATE INDEX "admission_applications_created_by_idx" ON "admission_applications"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_school_number_key" ON "admission_applications"("school_id", "application_number");

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_requested_grade_id_school_id_fkey" FOREIGN KEY ("requested_grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
