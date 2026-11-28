-- CreateEnum
CREATE TYPE "graduation_candidate_statuses" AS ENUM ('PENDING', 'ELIGIBLE', 'NOT_ELIGIBLE', 'REVIEW_REQUIRED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "grade_progression_rules" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "current_grade_id" UUID NOT NULL,
    "next_grade_id" UUID,
    "is_graduation_grade" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "grade_progression_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "terminal_grade_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "minimum_overall_percentage" DECIMAL(5,2),
    "minimum_grade_point" DECIMAL(5,2),
    "minimum_attendance_percentage" DECIMAL(5,2),
    "minimum_passed_subjects" INTEGER NOT NULL DEFAULT 0,
    "maximum_failed_subjects" INTEGER NOT NULL DEFAULT 0,
    "require_completed_examinations" BOOLEAN NOT NULL DEFAULT true,
    "require_approved_results" BOOLEAN NOT NULL DEFAULT true,
    "require_all_core_subjects_passed" BOOLEAN NOT NULL DEFAULT true,
    "status" "promotion_configuration_statuses" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "graduation_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_candidates" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "status" "graduation_candidate_statuses" NOT NULL DEFAULT 'PENDING',
    "overall_percentage" DECIMAL(5,2),
    "average_grade_point" DECIMAL(5,2),
    "attendance_percentage" DECIMAL(5,2),
    "total_subjects" INTEGER NOT NULL DEFAULT 0,
    "passed_subjects" INTEGER NOT NULL DEFAULT 0,
    "failed_subjects" INTEGER NOT NULL DEFAULT 0,
    "completed_examinations" BOOLEAN NOT NULL DEFAULT false,
    "approved_results" BOOLEAN NOT NULL DEFAULT false,
    "assessment_reasons" JSONB,
    "assessed_by_id" UUID NOT NULL,
    "assessed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "graduation_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "grade_progression_rules_school_id_academic_year_id_is_activ_idx" ON "grade_progression_rules"("school_id", "academic_year_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "grade_progression_rules_school_id_academic_year_id_current__key" ON "grade_progression_rules"("school_id", "academic_year_id", "current_grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "grade_progression_rules_id_school_id_key" ON "grade_progression_rules"("id", "school_id");

-- CreateIndex
CREATE INDEX "graduation_configurations_school_id_academic_year_id_status_idx" ON "graduation_configurations"("school_id", "academic_year_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_configurations_school_id_academic_year_id_termin_key" ON "graduation_configurations"("school_id", "academic_year_id", "terminal_grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_configurations_id_school_id_key" ON "graduation_configurations"("id", "school_id");

-- CreateIndex
CREATE INDEX "graduation_candidates_school_id_configuration_id_status_idx" ON "graduation_candidates"("school_id", "configuration_id", "status");

-- CreateIndex
CREATE INDEX "graduation_candidates_school_id_academic_year_id_status_idx" ON "graduation_candidates"("school_id", "academic_year_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_candidates_school_id_student_id_academic_year_id_key" ON "graduation_candidates"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_candidates_id_school_id_key" ON "graduation_candidates"("id", "school_id");

-- AddForeignKey
ALTER TABLE "grade_progression_rules" ADD CONSTRAINT "grade_progression_rules_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_progression_rules" ADD CONSTRAINT "grade_progression_rules_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_progression_rules" ADD CONSTRAINT "grade_progression_rules_current_grade_id_school_id_fkey" FOREIGN KEY ("current_grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_progression_rules" ADD CONSTRAINT "grade_progression_rules_next_grade_id_school_id_fkey" FOREIGN KEY ("next_grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_configurations" ADD CONSTRAINT "graduation_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_configurations" ADD CONSTRAINT "graduation_configurations_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_configurations" ADD CONSTRAINT "graduation_configurations_terminal_grade_id_school_id_fkey" FOREIGN KEY ("terminal_grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_configurations" ADD CONSTRAINT "graduation_configurations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_candidates" ADD CONSTRAINT "graduation_candidates_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_candidates" ADD CONSTRAINT "graduation_candidates_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_candidates" ADD CONSTRAINT "graduation_candidates_enrollment_id_school_id_fkey" FOREIGN KEY ("enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_candidates" ADD CONSTRAINT "graduation_candidates_configuration_id_school_id_fkey" FOREIGN KEY ("configuration_id", "school_id") REFERENCES "graduation_configurations"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_candidates" ADD CONSTRAINT "graduation_candidates_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_candidates" ADD CONSTRAINT "graduation_candidates_assessed_by_id_fkey" FOREIGN KEY ("assessed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_candidates" ADD CONSTRAINT "graduation_candidates_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
