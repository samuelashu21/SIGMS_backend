/*
  Warnings:

  - A unique constraint covering the columns `[id,school_id]` on the table `academic_enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "enrollment_history_actions" AS ENUM ('ENROLLED', 'GRADE_ASSIGNED', 'SECTION_ASSIGNED', 'STATUS_CHANGED');

-- CreateEnum
CREATE TYPE "student_academic_record_types" AS ENUM ('ACADEMIC_ACHIEVEMENT', 'ACADEMIC_MILESTONE', 'PERFORMANCE_REMARK', 'TEACHER_REMARK', 'GENERAL_ACADEMIC_NOTE');

-- CreateTable
CREATE TABLE "enrollment_history" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "changed_by_id" UUID,
    "action" "enrollment_history_actions" NOT NULL,
    "previous_grade_id" UUID,
    "new_grade_id" UUID,
    "previous_section_id" UUID,
    "new_section_id" UUID,
    "previous_status" "academic_enrollment_statuses",
    "new_status" "academic_enrollment_statuses",
    "reason" TEXT,
    "changed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_academic_records" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "enrollment_id" UUID,
    "created_by_id" UUID NOT NULL,
    "record_type" "student_academic_record_types" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject_name" TEXT,
    "record_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_academic_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enrollment_history_school_enrollment_idx" ON "enrollment_history"("school_id", "enrollment_id", "changed_at");

-- CreateIndex
CREATE INDEX "enrollment_history_actor_idx" ON "enrollment_history"("changed_by_id", "changed_at");

-- CreateIndex
CREATE INDEX "student_academic_records_school_student_date_idx" ON "student_academic_records"("school_id", "student_id", "record_date");

-- CreateIndex
CREATE INDEX "student_academic_records_school_type_idx" ON "student_academic_records"("school_id", "record_type");

-- CreateIndex
CREATE INDEX "student_academic_records_enrollment_idx" ON "student_academic_records"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_enrollments_id_school_key" ON "academic_enrollments"("id", "school_id");

-- AddForeignKey
ALTER TABLE "enrollment_history" ADD CONSTRAINT "enrollment_history_enrollment_id_school_id_fkey" FOREIGN KEY ("enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollment_history" ADD CONSTRAINT "enrollment_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_records" ADD CONSTRAINT "student_academic_records_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_records" ADD CONSTRAINT "student_academic_records_enrollment_id_school_id_fkey" FOREIGN KEY ("enrollment_id", "school_id") REFERENCES "academic_enrollments"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_records" ADD CONSTRAINT "student_academic_records_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
