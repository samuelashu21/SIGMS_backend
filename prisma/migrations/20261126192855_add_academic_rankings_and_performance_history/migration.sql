-- CreateEnum
CREATE TYPE "academic_ranking_scopes" AS ENUM ('GRADE', 'SECTION');

-- CreateEnum
CREATE TYPE "academic_ranking_periods" AS ENUM ('SEMESTER', 'ANNUAL');

-- CreateEnum
CREATE TYPE "academic_performance_history_types" AS ENUM ('SUBJECT_GRADE', 'SEMESTER_AVERAGE', 'ANNUAL_AVERAGE', 'PERFORMANCE_SUMMARY', 'RANKING');

-- CreateEnum
CREATE TYPE "academic_performance_history_actions" AS ENUM ('CREATED', 'RECALCULATED', 'CORRECTED', 'PUBLISHED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "academic_ranking_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "ranking_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ranking_scope" "academic_ranking_scopes" NOT NULL DEFAULT 'GRADE',
    "allow_student_visibility" BOOLEAN NOT NULL DEFAULT false,
    "allow_parent_visibility" BOOLEAN NOT NULL DEFAULT false,
    "minimum_students" INTEGER NOT NULL DEFAULT 2,
    "include_ties" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_ranking_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_student_rankings" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "section_id" UUID,
    "semester_id" UUID,
    "period" "academic_ranking_periods" NOT NULL,
    "period_key" VARCHAR(100) NOT NULL,
    "scope" "academic_ranking_scopes" NOT NULL,
    "scope_key" VARCHAR(100) NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DECIMAL(8,2) NOT NULL,
    "total_students" INTEGER NOT NULL,
    "tied" BOOLEAN NOT NULL DEFAULT false,
    "calculated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_student_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_performance_history" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "semester_id" UUID,
    "source_id" UUID,
    "history_type" "academic_performance_history_types" NOT NULL,
    "action" "academic_performance_history_actions" NOT NULL,
    "previous_values" JSONB,
    "new_values" JSONB NOT NULL,
    "reason" TEXT,
    "performed_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_performance_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_ranking_configurations_school_id_academic_year_id__key" ON "academic_ranking_configurations"("school_id", "academic_year_id", "grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_ranking_configurations_id_school_id_key" ON "academic_ranking_configurations"("id", "school_id");

-- CreateIndex
CREATE INDEX "academic_student_rankings_school_id_academic_year_id_grade__idx" ON "academic_student_rankings"("school_id", "academic_year_id", "grade_id", "period_key", "scope_key", "rank");

-- CreateIndex
CREATE INDEX "academic_student_rankings_school_id_student_id_academic_yea_idx" ON "academic_student_rankings"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_student_rankings_school_id_student_id_academic_yea_key" ON "academic_student_rankings"("school_id", "student_id", "academic_year_id", "period_key", "scope_key");

-- CreateIndex
CREATE UNIQUE INDEX "academic_student_rankings_id_school_id_key" ON "academic_student_rankings"("id", "school_id");

-- CreateIndex
CREATE INDEX "academic_performance_history_school_id_student_id_academic__idx" ON "academic_performance_history"("school_id", "student_id", "academic_year_id", "created_at");

-- CreateIndex
CREATE INDEX "academic_performance_history_school_id_history_type_action__idx" ON "academic_performance_history"("school_id", "history_type", "action", "created_at");

-- CreateIndex
CREATE INDEX "academic_performance_history_source_id_idx" ON "academic_performance_history"("source_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_performance_history_id_school_id_key" ON "academic_performance_history"("id", "school_id");

-- AddForeignKey
ALTER TABLE "academic_ranking_configurations" ADD CONSTRAINT "academic_ranking_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_ranking_configurations" ADD CONSTRAINT "academic_ranking_configurations_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_ranking_configurations" ADD CONSTRAINT "academic_ranking_configurations_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_student_rankings" ADD CONSTRAINT "academic_student_rankings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_student_rankings" ADD CONSTRAINT "academic_student_rankings_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_student_rankings" ADD CONSTRAINT "academic_student_rankings_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_student_rankings" ADD CONSTRAINT "academic_student_rankings_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_student_rankings" ADD CONSTRAINT "academic_student_rankings_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_student_rankings" ADD CONSTRAINT "academic_student_rankings_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_history" ADD CONSTRAINT "academic_performance_history_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_history" ADD CONSTRAINT "academic_performance_history_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_history" ADD CONSTRAINT "academic_performance_history_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_history" ADD CONSTRAINT "academic_performance_history_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_performance_history" ADD CONSTRAINT "academic_performance_history_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
