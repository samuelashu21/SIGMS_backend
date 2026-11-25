-- CreateEnum
CREATE TYPE "attendance_statuses" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "attendance_sessions" AS ENUM ('MORNING', 'AFTERNOON', 'FULL_DAY');

-- CreateEnum
CREATE TYPE "attendance_record_statuses" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "attendance_correction_statuses" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "class_attendance" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "recorded_by_id" UUID NOT NULL,
    "attendance_date" DATE NOT NULL,
    "session" "attendance_sessions" NOT NULL DEFAULT 'FULL_DAY',
    "status" "attendance_record_statuses" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMPTZ(3),
    "approved_at" TIMESTAMPTZ(3),
    "approved_by_id" UUID,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "class_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "class_attendance_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" "attendance_statuses" NOT NULL,
    "arrival_time" TIMESTAMPTZ(3),
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_attendance_date_status_idx" ON "class_attendance"("school_id", "attendance_date", "status");

-- CreateIndex
CREATE INDEX "class_attendance_section_date_idx" ON "class_attendance"("school_id", "section_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "class_attendance_section_date_session_key" ON "class_attendance"("school_id", "section_id", "attendance_date", "session");

-- CreateIndex
CREATE UNIQUE INDEX "class_attendance_id_school_key" ON "class_attendance"("id", "school_id");

-- CreateIndex
CREATE INDEX "attendance_record_student_idx" ON "attendance_records"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "attendance_record_status_idx" ON "attendance_records"("school_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_record_session_student_key" ON "attendance_records"("school_id", "class_attendance_id", "student_id");

-- AddForeignKey
ALTER TABLE "class_attendance" ADD CONSTRAINT "class_attendance_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_attendance" ADD CONSTRAINT "class_attendance_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_attendance" ADD CONSTRAINT "class_attendance_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_attendance" ADD CONSTRAINT "class_attendance_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_class_attendance_id_school_id_fkey" FOREIGN KEY ("class_attendance_id", "school_id") REFERENCES "class_attendance"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
