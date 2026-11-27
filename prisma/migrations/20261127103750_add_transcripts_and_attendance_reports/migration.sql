-- CreateEnum
CREATE TYPE "report_card_statuses" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "report_period_types" AS ENUM ('SEMESTER', 'ANNUAL');

-- CreateEnum
CREATE TYPE "report_card_history_actions" AS ENUM ('CREATED', 'GENERATED', 'UPDATED', 'PUBLISHED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "transcript_statuses" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "attendance_report_scopes" AS ENUM ('STUDENT', 'SECTION');

-- CreateTable
CREATE TABLE "report_cards" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "semester_id" UUID,
    "report_number" VARCHAR(100) NOT NULL,
    "period_type" "report_period_types" NOT NULL,
    "status" "report_card_statuses" NOT NULL DEFAULT 'DRAFT',
    "grade_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "overall_percentage" DECIMAL(8,2),
    "overall_grade_point" DECIMAL(5,2),
    "total_subjects" INTEGER NOT NULL DEFAULT 0,
    "passed_subjects" INTEGER NOT NULL DEFAULT 0,
    "failed_subjects" INTEGER NOT NULL DEFAULT 0,
    "attendance_percentage" DECIMAL(8,2),
    "teacher_remarks" TEXT,
    "principal_remarks" TEXT,
    "generated_at" TIMESTAMPTZ(3),
    "published_at" TIMESTAMPTZ(3),
    "published_by_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_card_subjects" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "report_card_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "subject_name" VARCHAR(150) NOT NULL,
    "maximum_marks" DECIMAL(8,2) NOT NULL,
    "obtained_marks" DECIMAL(8,2) NOT NULL,
    "percentage" DECIMAL(8,2) NOT NULL,
    "letter_grade" VARCHAR(10),
    "grade_point" DECIMAL(5,2),
    "grade_remark" VARCHAR(50),
    "teacher_remarks" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_card_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_card_attendance" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "report_card_id" UUID NOT NULL,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "present_days" INTEGER NOT NULL DEFAULT 0,
    "absent_days" INTEGER NOT NULL DEFAULT 0,
    "late_days" INTEGER NOT NULL DEFAULT 0,
    "excused_days" INTEGER NOT NULL DEFAULT 0,
    "half_days" INTEGER NOT NULL DEFAULT 0,
    "attendance_percentage" DECIMAL(8,2),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_card_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_card_history" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "report_card_id" UUID NOT NULL,
    "performed_by_id" UUID NOT NULL,
    "action" "report_card_history_actions" NOT NULL,
    "description" TEXT,
    "previous_values" JSONB,
    "new_values" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_card_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_academic_transcripts" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "transcript_number" VARCHAR(100) NOT NULL,
    "status" "transcript_statuses" NOT NULL DEFAULT 'DRAFT',
    "total_academic_years" INTEGER NOT NULL DEFAULT 0,
    "total_subjects" INTEGER NOT NULL DEFAULT 0,
    "cumulative_grade_point" DECIMAL(5,2),
    "cumulative_percentage" DECIMAL(8,2),
    "generated_at" TIMESTAMPTZ(3),
    "published_at" TIMESTAMPTZ(3),
    "published_by_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "student_academic_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_transcript_entries" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "transcript_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "semester_id" UUID,
    "subject_id" UUID NOT NULL,
    "period_key" VARCHAR(100) NOT NULL,
    "academic_year_name" VARCHAR(100) NOT NULL,
    "grade_name" VARCHAR(100) NOT NULL,
    "semester_name" VARCHAR(100),
    "subject_name" VARCHAR(150) NOT NULL,
    "percentage" DECIMAL(8,2) NOT NULL,
    "letter_grade" VARCHAR(10),
    "grade_point" DECIMAL(5,2),
    "grade_remark" VARCHAR(50),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_transcript_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_transcript_history" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "transcript_id" UUID NOT NULL,
    "performed_by_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "previous_values" JSONB,
    "new_values" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_transcript_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_reports" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "student_id" UUID,
    "section_id" UUID,
    "semester_id" UUID,
    "report_number" VARCHAR(100) NOT NULL,
    "scope" "attendance_report_scopes" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "present_count" INTEGER NOT NULL DEFAULT 0,
    "absent_count" INTEGER NOT NULL DEFAULT 0,
    "late_count" INTEGER NOT NULL DEFAULT 0,
    "excused_count" INTEGER NOT NULL DEFAULT 0,
    "half_day_count" INTEGER NOT NULL DEFAULT 0,
    "attendance_percentage" DECIMAL(8,2),
    "report_details" JSONB,
    "generated_by_id" UUID NOT NULL,
    "generated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_cards_school_id_student_id_academic_year_id_idx" ON "report_cards"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "report_cards_school_id_academic_year_id_semester_id_status_idx" ON "report_cards"("school_id", "academic_year_id", "semester_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_school_id_report_number_key" ON "report_cards"("school_id", "report_number");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_id_school_id_key" ON "report_cards"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_card_subjects_school_id_report_card_id_subject_id_key" ON "report_card_subjects"("school_id", "report_card_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_card_subjects_id_school_id_key" ON "report_card_subjects"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_card_attendance_report_card_id_key" ON "report_card_attendance"("report_card_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_card_attendance_report_card_id_school_id_key" ON "report_card_attendance"("report_card_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_card_attendance_id_school_id_key" ON "report_card_attendance"("id", "school_id");

-- CreateIndex
CREATE INDEX "report_card_history_school_id_report_card_id_created_at_idx" ON "report_card_history"("school_id", "report_card_id", "created_at");

-- CreateIndex
CREATE INDEX "student_academic_transcripts_school_id_student_id_created_a_idx" ON "student_academic_transcripts"("school_id", "student_id", "created_at");

-- CreateIndex
CREATE INDEX "student_academic_transcripts_school_id_status_idx" ON "student_academic_transcripts"("school_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "student_academic_transcripts_school_id_transcript_number_key" ON "student_academic_transcripts"("school_id", "transcript_number");

-- CreateIndex
CREATE UNIQUE INDEX "student_academic_transcripts_id_school_id_key" ON "student_academic_transcripts"("id", "school_id");

-- CreateIndex
CREATE INDEX "academic_transcript_entries_school_id_academic_year_id_grad_idx" ON "academic_transcript_entries"("school_id", "academic_year_id", "grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_transcript_entries_school_id_transcript_id_period__key" ON "academic_transcript_entries"("school_id", "transcript_id", "period_key", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_transcript_entries_id_school_id_key" ON "academic_transcript_entries"("id", "school_id");

-- CreateIndex
CREATE INDEX "academic_transcript_history_school_id_transcript_id_created_idx" ON "academic_transcript_history"("school_id", "transcript_id", "created_at");

-- CreateIndex
CREATE INDEX "attendance_reports_school_id_student_id_academic_year_id_idx" ON "attendance_reports"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "attendance_reports_school_id_section_id_academic_year_id_idx" ON "attendance_reports"("school_id", "section_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "attendance_reports_school_id_generated_at_idx" ON "attendance_reports"("school_id", "generated_at");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_reports_id_school_id_key" ON "attendance_reports"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_reports_school_id_report_number_key" ON "attendance_reports"("school_id", "report_number");

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_enrollment_id_school_id_fkey" FOREIGN KEY ("enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_subjects" ADD CONSTRAINT "report_card_subjects_report_card_id_school_id_fkey" FOREIGN KEY ("report_card_id", "school_id") REFERENCES "report_cards"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_subjects" ADD CONSTRAINT "report_card_subjects_subject_id_school_id_fkey" FOREIGN KEY ("subject_id", "school_id") REFERENCES "subjects"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_subjects" ADD CONSTRAINT "report_card_subjects_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_attendance" ADD CONSTRAINT "report_card_attendance_report_card_id_school_id_fkey" FOREIGN KEY ("report_card_id", "school_id") REFERENCES "report_cards"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_history" ADD CONSTRAINT "report_card_history_report_card_id_school_id_fkey" FOREIGN KEY ("report_card_id", "school_id") REFERENCES "report_cards"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_history" ADD CONSTRAINT "report_card_history_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_card_history" ADD CONSTRAINT "report_card_history_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_transcripts" ADD CONSTRAINT "student_academic_transcripts_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_transcripts" ADD CONSTRAINT "student_academic_transcripts_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_transcripts" ADD CONSTRAINT "student_academic_transcripts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_transcripts" ADD CONSTRAINT "student_academic_transcripts_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_entries" ADD CONSTRAINT "academic_transcript_entries_transcript_id_school_id_fkey" FOREIGN KEY ("transcript_id", "school_id") REFERENCES "student_academic_transcripts"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_entries" ADD CONSTRAINT "academic_transcript_entries_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_entries" ADD CONSTRAINT "academic_transcript_entries_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_entries" ADD CONSTRAINT "academic_transcript_entries_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_entries" ADD CONSTRAINT "academic_transcript_entries_subject_id_school_id_fkey" FOREIGN KEY ("subject_id", "school_id") REFERENCES "subjects"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_entries" ADD CONSTRAINT "academic_transcript_entries_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_history" ADD CONSTRAINT "academic_transcript_history_transcript_id_school_id_fkey" FOREIGN KEY ("transcript_id", "school_id") REFERENCES "student_academic_transcripts"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_history" ADD CONSTRAINT "academic_transcript_history_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_transcript_history" ADD CONSTRAINT "academic_transcript_history_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
