-- CreateEnum
CREATE TYPE "academic_grade_calculation_methods" AS ENUM ('WEIGHTED_AVERAGE', 'SIMPLE_AVERAGE');

-- CreateTable
CREATE TABLE "academic_grading_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "grading_system_id" UUID NOT NULL,
    "calculation_method" "academic_grade_calculation_methods" NOT NULL DEFAULT 'WEIGHTED_AVERAGE',
    "passing_percentage" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "rounding_mode" "examination_rounding_modes" NOT NULL DEFAULT 'ROUND',
    "require_all_assessments" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_grading_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_grade_results" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "semester_id" UUID NOT NULL,
    "raw_percentage" DECIMAL(8,4) NOT NULL,
    "final_percentage" DECIMAL(8,2) NOT NULL,
    "letter_grade" VARCHAR(20),
    "grade_point" DECIMAL(5,2),
    "grade_remark" VARCHAR(255),
    "assessment_count" INTEGER NOT NULL DEFAULT 0,
    "calculation_details" JSONB,
    "calculated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "subject_grade_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_grading_configurations_school_id_academic_year_id__idx" ON "academic_grading_configurations"("school_id", "academic_year_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "academic_grading_configurations_school_id_academic_year_id_key" ON "academic_grading_configurations"("school_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_grading_configurations_id_school_id_key" ON "academic_grading_configurations"("id", "school_id");

-- CreateIndex
CREATE INDEX "subject_grade_results_school_id_academic_year_id_semester_i_idx" ON "subject_grade_results"("school_id", "academic_year_id", "semester_id", "subject_id");

-- CreateIndex
CREATE INDEX "subject_grade_results_school_id_student_id_academic_year_id_idx" ON "subject_grade_results"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_grade_results_school_id_student_id_subject_id_acade_key" ON "subject_grade_results"("school_id", "student_id", "subject_id", "academic_year_id", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_grade_results_id_school_id_key" ON "subject_grade_results"("id", "school_id");

-- AddForeignKey
ALTER TABLE "academic_grading_configurations" ADD CONSTRAINT "academic_grading_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_grading_configurations" ADD CONSTRAINT "academic_grading_configurations_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_grading_configurations" ADD CONSTRAINT "academic_grading_configurations_grading_system_id_school_i_fkey" FOREIGN KEY ("grading_system_id", "school_id") REFERENCES "grading_systems"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_grade_results" ADD CONSTRAINT "subject_grade_results_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_grade_results" ADD CONSTRAINT "subject_grade_results_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_grade_results" ADD CONSTRAINT "subject_grade_results_subject_id_school_id_fkey" FOREIGN KEY ("subject_id", "school_id") REFERENCES "subjects"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_grade_results" ADD CONSTRAINT "subject_grade_results_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_grade_results" ADD CONSTRAINT "subject_grade_results_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
