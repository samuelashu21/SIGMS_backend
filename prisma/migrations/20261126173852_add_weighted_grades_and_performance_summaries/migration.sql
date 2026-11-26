-- CreateEnum
CREATE TYPE "academic_performance_summary_types" AS ENUM ('SEMESTER', 'ANNUAL');

-- CreateTable
CREATE TABLE "academic_subject_weights" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "weight" DECIMAL(8,4) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_subject_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_semester_weights" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "semester_id" UUID NOT NULL,
    "weight" DECIMAL(8,4) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_semester_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_performance_summaries" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "semester_id" UUID,
    "summary_type" "academic_performance_summary_types" NOT NULL,
    "overall_percentage" DECIMAL(8,2),
    "overall_grade_point" DECIMAL(5,2),
    "total_subjects" INTEGER NOT NULL DEFAULT 0,
    "passed_subjects" INTEGER NOT NULL DEFAULT 0,
    "failed_subjects" INTEGER NOT NULL DEFAULT 0,
    "attendance_percentage" DECIMAL(8,2),
    "highest_subject_percentage" DECIMAL(8,2),
    "lowest_subject_percentage" DECIMAL(8,2),
    "performance_details" JSONB,
    "generated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "period_key" VARCHAR(100) NOT NULL,

    CONSTRAINT "academic_performance_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_subject_weights_school_id_academic_year_id_grade_i_idx" ON "academic_subject_weights"("school_id", "academic_year_id", "grade_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "academic_subject_weights_school_id_academic_year_id_grade_i_key" ON "academic_subject_weights"("school_id", "academic_year_id", "grade_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_subject_weights_id_school_id_key" ON "academic_subject_weights"("id", "school_id");

-- CreateIndex
CREATE INDEX "academic_semester_weights_school_id_academic_year_id_is_act_idx" ON "academic_semester_weights"("school_id", "academic_year_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "academic_semester_weights_school_id_academic_year_id_semest_key" ON "academic_semester_weights"("school_id", "academic_year_id", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_semester_weights_id_school_id_key" ON "academic_semester_weights"("id", "school_id");

-- CreateIndex
CREATE INDEX "academic_performance_summaries_school_id_academic_year_id_s_idx" ON "academic_performance_summaries"("school_id", "academic_year_id", "summary_type");

-- CreateIndex
CREATE INDEX "academic_performance_summaries_school_id_student_id_academi_idx" ON "academic_performance_summaries"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_performance_summaries_school_id_student_id_academi_key" ON "academic_performance_summaries"("school_id", "student_id", "academic_year_id", "period_key");

-- CreateIndex
CREATE UNIQUE INDEX "academic_performance_summaries_id_school_id_key" ON "academic_performance_summaries"("id", "school_id");

-- AddForeignKey
ALTER TABLE "academic_subject_weights" ADD CONSTRAINT "academic_subject_weights_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_subject_weights" ADD CONSTRAINT "academic_subject_weights_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_subject_weights" ADD CONSTRAINT "academic_subject_weights_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_subject_weights" ADD CONSTRAINT "academic_subject_weights_subject_id_school_id_fkey" FOREIGN KEY ("subject_id", "school_id") REFERENCES "subjects"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_semester_weights" ADD CONSTRAINT "academic_semester_weights_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_semester_weights" ADD CONSTRAINT "academic_semester_weights_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_semester_weights" ADD CONSTRAINT "academic_semester_weights_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_summaries" ADD CONSTRAINT "academic_performance_summaries_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_summaries" ADD CONSTRAINT "academic_performance_summaries_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_summaries" ADD CONSTRAINT "academic_performance_summaries_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_summaries" ADD CONSTRAINT "academic_performance_summaries_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
