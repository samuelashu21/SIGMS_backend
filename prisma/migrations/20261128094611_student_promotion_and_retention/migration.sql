-- CreateTable
CREATE TABLE "promotion_decisions" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "current_enrollment_id" UUID NOT NULL,
    "next_enrollment_id" UUID NOT NULL,
    "eligibility_assessment_id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "next_academic_year_id" UUID NOT NULL,
    "target_grade_id" UUID NOT NULL,
    "target_section_id" UUID NOT NULL,
    "action" "promotion_actions" NOT NULL,
    "reason" TEXT,
    "override_reason" TEXT,
    "decided_by_id" UUID NOT NULL,
    "decided_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_decisions_school_id_student_id_decided_at_idx" ON "promotion_decisions"("school_id", "student_id", "decided_at");

-- CreateIndex
CREATE INDEX "promotion_decisions_school_id_next_academic_year_id_target__idx" ON "promotion_decisions"("school_id", "next_academic_year_id", "target_grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_decisions_school_id_current_enrollment_id_key" ON "promotion_decisions"("school_id", "current_enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_decisions_school_id_next_enrollment_id_key" ON "promotion_decisions"("school_id", "next_enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_decisions_id_school_id_key" ON "promotion_decisions"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_decisions_eligibility_assessment_id_school_id_key" ON "promotion_decisions"("eligibility_assessment_id", "school_id");

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_current_enrollment_id_school_id_fkey" FOREIGN KEY ("current_enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_next_enrollment_id_school_id_fkey" FOREIGN KEY ("next_enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_eligibility_assessment_id_school_id_fkey" FOREIGN KEY ("eligibility_assessment_id", "school_id") REFERENCES "promotion_eligibility_assessments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_configuration_id_school_id_fkey" FOREIGN KEY ("configuration_id", "school_id") REFERENCES "promotion_configurations"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_next_academic_year_id_school_id_fkey" FOREIGN KEY ("next_academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_target_grade_id_school_id_fkey" FOREIGN KEY ("target_grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_target_section_id_school_id_fkey" FOREIGN KEY ("target_section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_decisions" ADD CONSTRAINT "promotion_decisions_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
