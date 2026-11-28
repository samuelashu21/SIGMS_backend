-- CreateEnum
CREATE TYPE "graduation_record_statuses" AS ENUM ('CONFIRMED', 'REVOKED');

-- CreateEnum
CREATE TYPE "academic_progression_actions" AS ENUM ('ENROLLED', 'PROMOTED', 'RETAINED', 'GRADUATED', 'CORRECTED');

-- CreateTable
CREATE TABLE "graduation_records" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "terminal_grade_id" UUID NOT NULL,
    "graduation_number" VARCHAR(100) NOT NULL,
    "graduation_date" DATE NOT NULL,
    "qualification" VARCHAR(200),
    "distinction" VARCHAR(150),
    "remarks" TEXT,
    "status" "graduation_record_statuses" NOT NULL DEFAULT 'CONFIRMED',
    "approved_by_id" UUID NOT NULL,
    "approved_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_by_id" UUID,
    "revoked_at" TIMESTAMPTZ(3),
    "revocation_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "graduation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_progression_history" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "current_enrollment_id" UUID,
    "previous_enrollment_id" UUID,
    "academic_year_id" UUID NOT NULL,
    "previous_grade_id" UUID,
    "new_grade_id" UUID,
    "previous_section_id" UUID,
    "new_section_id" UUID,
    "action" "academic_progression_actions" NOT NULL,
    "reason" TEXT,
    "details" JSONB,
    "performed_by_id" UUID NOT NULL,
    "performed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_progression_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "graduation_records_school_id_academic_year_id_status_idx" ON "graduation_records"("school_id", "academic_year_id", "status");

-- CreateIndex
CREATE INDEX "graduation_records_school_id_student_id_idx" ON "graduation_records"("school_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_records_school_id_graduation_number_key" ON "graduation_records"("school_id", "graduation_number");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_records_school_id_student_id_academic_year_id_key" ON "graduation_records"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_records_id_school_id_key" ON "graduation_records"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_records_candidate_id_school_id_key" ON "graduation_records"("candidate_id", "school_id");

-- CreateIndex
CREATE INDEX "academic_progression_history_school_id_student_id_performed_idx" ON "academic_progression_history"("school_id", "student_id", "performed_at");

-- CreateIndex
CREATE INDEX "academic_progression_history_school_id_academic_year_id_act_idx" ON "academic_progression_history"("school_id", "academic_year_id", "action");

-- CreateIndex
CREATE INDEX "academic_progression_history_school_id_action_performed_at_idx" ON "academic_progression_history"("school_id", "action", "performed_at");

-- CreateIndex
CREATE UNIQUE INDEX "academic_progression_history_id_school_id_key" ON "academic_progression_history"("id", "school_id");

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_enrollment_id_school_id_fkey" FOREIGN KEY ("enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_candidate_id_school_id_fkey" FOREIGN KEY ("candidate_id", "school_id") REFERENCES "graduation_candidates"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_terminal_grade_id_school_id_fkey" FOREIGN KEY ("terminal_grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_records" ADD CONSTRAINT "graduation_records_revoked_by_id_fkey" FOREIGN KEY ("revoked_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_current_enrollment_id_school__fkey" FOREIGN KEY ("current_enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_previous_enrollment_id_school_fkey" FOREIGN KEY ("previous_enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_previous_grade_id_school_id_fkey" FOREIGN KEY ("previous_grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_new_grade_id_school_id_fkey" FOREIGN KEY ("new_grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_previous_section_id_school_id_fkey" FOREIGN KEY ("previous_section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_new_section_id_school_id_fkey" FOREIGN KEY ("new_section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_progression_history" ADD CONSTRAINT "academic_progression_history_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
