-- CreateEnum
CREATE TYPE "examination_report_scopes" AS ENUM ('EXAMINATION', 'STUDENT', 'SECTION', 'SUBJECT');

-- CreateEnum
CREATE TYPE "report_publication_statuses" AS ENUM ('GENERATED', 'PUBLISHED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "attendance_reports" ADD COLUMN     "published_at" TIMESTAMPTZ(3),
ADD COLUMN     "published_by_id" UUID,
ADD COLUMN     "status" "report_publication_statuses" NOT NULL DEFAULT 'GENERATED';

-- CreateTable
CREATE TABLE "examination_reports" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "student_id" UUID,
    "section_id" UUID,
    "subject_id" UUID,
    "report_number" VARCHAR(100) NOT NULL,
    "scope" "examination_report_scopes" NOT NULL,
    "total_students" INTEGER NOT NULL DEFAULT 0,
    "submitted_marks" INTEGER NOT NULL DEFAULT 0,
    "approved_marks" INTEGER NOT NULL DEFAULT 0,
    "average_marks" DECIMAL(8,2),
    "highest_marks" DECIMAL(8,2),
    "lowest_marks" DECIMAL(8,2),
    "pass_count" INTEGER NOT NULL DEFAULT 0,
    "fail_count" INTEGER NOT NULL DEFAULT 0,
    "pass_percentage" DECIMAL(8,2),
    "report_details" JSONB,
    "generated_by_id" UUID NOT NULL,
    "generated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "report_publication_statuses" NOT NULL DEFAULT 'GENERATED',
    "published_at" TIMESTAMPTZ(3),
    "published_by_id" UUID,

    CONSTRAINT "examination_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_account_links" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "verified_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "student_account_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examination_reports_school_id_examination_id_idx" ON "examination_reports"("school_id", "examination_id");

-- CreateIndex
CREATE INDEX "examination_reports_school_id_student_id_idx" ON "examination_reports"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "examination_reports_school_id_section_id_idx" ON "examination_reports"("school_id", "section_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_reports_id_school_id_key" ON "examination_reports"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_reports_school_id_report_number_key" ON "examination_reports"("school_id", "report_number");

-- CreateIndex
CREATE INDEX "student_account_links_school_id_student_id_is_active_idx" ON "student_account_links"("school_id", "student_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "student_account_links_school_id_student_id_key" ON "student_account_links"("school_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_account_links_school_id_user_id_key" ON "student_account_links"("school_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_account_links_id_school_id_key" ON "student_account_links"("id", "school_id");

-- AddForeignKey
ALTER TABLE "attendance_reports" ADD CONSTRAINT "attendance_reports_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_reports" ADD CONSTRAINT "examination_reports_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_reports" ADD CONSTRAINT "examination_reports_examination_id_school_id_fkey" FOREIGN KEY ("examination_id", "school_id") REFERENCES "examinations"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_reports" ADD CONSTRAINT "examination_reports_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_reports" ADD CONSTRAINT "examination_reports_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_reports" ADD CONSTRAINT "examination_reports_subject_id_school_id_fkey" FOREIGN KEY ("subject_id", "school_id") REFERENCES "subjects"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_reports" ADD CONSTRAINT "examination_reports_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_reports" ADD CONSTRAINT "examination_reports_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_account_links" ADD CONSTRAINT "student_account_links_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_account_links" ADD CONSTRAINT "student_account_links_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_account_links" ADD CONSTRAINT "student_account_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
