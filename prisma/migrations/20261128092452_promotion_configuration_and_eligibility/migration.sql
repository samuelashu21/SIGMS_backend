-- CreateEnum
CREATE TYPE "promotion_decision_types" AS ENUM ('AUTOMATIC_ELIGIBILITY', 'MANUAL_REVIEW', 'EXAMINATION_BASED', 'PERFORMANCE_BASED');

-- CreateEnum
CREATE TYPE "promotion_configuration_statuses" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "promotion_eligibility_statuses" AS ENUM ('ELIGIBLE', 'NOT_ELIGIBLE', 'REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "promotion_actions" AS ENUM ('PROMOTED', 'RETAINED', 'GRADUATED');

-- CreateTable
CREATE TABLE "promotion_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "decision_type" "promotion_decision_types" NOT NULL,
    "minimum_overall_percentage" DECIMAL(5,2),
    "minimum_grade_point" DECIMAL(5,2),
    "minimum_attendance_percentage" DECIMAL(5,2),
    "minimum_passed_subjects" INTEGER NOT NULL DEFAULT 0,
    "maximum_failed_subjects" INTEGER NOT NULL DEFAULT 0,
    "require_all_core_subjects_passed" BOOLEAN NOT NULL DEFAULT true,
    "require_completed_examinations" BOOLEAN NOT NULL DEFAULT true,
    "require_approved_results" BOOLEAN NOT NULL DEFAULT true,
    "allow_manual_override" BOOLEAN NOT NULL DEFAULT false,
    "require_principal_approval" BOOLEAN NOT NULL DEFAULT true,
    "status" "promotion_configuration_statuses" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "promotion_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_grade_rules" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "minimum_overall_percentage" DECIMAL(5,2),
    "minimum_grade_point" DECIMAL(5,2),
    "minimum_attendance_percentage" DECIMAL(5,2),
    "minimum_passed_subjects" INTEGER,
    "maximum_failed_subjects" INTEGER,
    "require_all_core_subjects_passed" BOOLEAN,
    "allow_promotion" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "promotion_grade_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_eligibility_assessments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "status" "promotion_eligibility_statuses" NOT NULL,
    "overall_percentage" DECIMAL(5,2),
    "average_grade_point" DECIMAL(5,2),
    "attendance_percentage" DECIMAL(5,2),
    "total_subjects" INTEGER NOT NULL DEFAULT 0,
    "passed_subjects" INTEGER NOT NULL DEFAULT 0,
    "failed_subjects" INTEGER NOT NULL DEFAULT 0,
    "completed_examinations" BOOLEAN NOT NULL DEFAULT false,
    "approved_results" BOOLEAN NOT NULL DEFAULT false,
    "reasons" JSONB,
    "assessed_by_id" UUID NOT NULL,
    "assessed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_eligibility_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_configurations_school_id_academic_year_id_status_idx" ON "promotion_configurations"("school_id", "academic_year_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_configurations_school_id_academic_year_id_name_key" ON "promotion_configurations"("school_id", "academic_year_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_configurations_id_school_id_key" ON "promotion_configurations"("id", "school_id");

-- CreateIndex
CREATE INDEX "promotion_grade_rules_school_id_grade_id_idx" ON "promotion_grade_rules"("school_id", "grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_grade_rules_school_id_configuration_id_grade_id_key" ON "promotion_grade_rules"("school_id", "configuration_id", "grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_grade_rules_id_school_id_key" ON "promotion_grade_rules"("id", "school_id");

-- CreateIndex
CREATE INDEX "promotion_eligibility_assessments_school_id_student_id_acad_idx" ON "promotion_eligibility_assessments"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "promotion_eligibility_assessments_school_id_configuration_i_idx" ON "promotion_eligibility_assessments"("school_id", "configuration_id", "status");

-- CreateIndex
CREATE INDEX "promotion_eligibility_assessments_school_id_assessed_at_idx" ON "promotion_eligibility_assessments"("school_id", "assessed_at");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_eligibility_assessments_id_school_id_key" ON "promotion_eligibility_assessments"("id", "school_id");

-- AddForeignKey
ALTER TABLE "promotion_configurations" ADD CONSTRAINT "promotion_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_configurations" ADD CONSTRAINT "promotion_configurations_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_configurations" ADD CONSTRAINT "promotion_configurations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_configurations" ADD CONSTRAINT "promotion_configurations_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_grade_rules" ADD CONSTRAINT "promotion_grade_rules_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_grade_rules" ADD CONSTRAINT "promotion_grade_rules_configuration_id_school_id_fkey" FOREIGN KEY ("configuration_id", "school_id") REFERENCES "promotion_configurations"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_grade_rules" ADD CONSTRAINT "promotion_grade_rules_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_eligibility_assessments" ADD CONSTRAINT "promotion_eligibility_assessments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_eligibility_assessments" ADD CONSTRAINT "promotion_eligibility_assessments_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_eligibility_assessments" ADD CONSTRAINT "promotion_eligibility_assessments_enrollment_id_school_id_fkey" FOREIGN KEY ("enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_eligibility_assessments" ADD CONSTRAINT "promotion_eligibility_assessments_configuration_id_school__fkey" FOREIGN KEY ("configuration_id", "school_id") REFERENCES "promotion_configurations"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_eligibility_assessments" ADD CONSTRAINT "promotion_eligibility_assessments_academic_year_id_school__fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_eligibility_assessments" ADD CONSTRAINT "promotion_eligibility_assessments_assessed_by_id_fkey" FOREIGN KEY ("assessed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
