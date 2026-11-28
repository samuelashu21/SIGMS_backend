-- CreateEnum
CREATE TYPE "timetable_days" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "timetable_period_types" AS ENUM ('LESSON', 'BREAK', 'LUNCH', 'ASSEMBLY', 'OTHER');

-- CreateEnum
CREATE TYPE "timetable_statuses" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "school_timetable_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "teaching_days" "timetable_days"[],
    "school_start_time" TIME(0) NOT NULL,
    "school_end_time" TIME(0) NOT NULL,
    "allow_teacher_double_booking" BOOLEAN NOT NULL DEFAULT false,
    "allow_section_double_booking" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "school_timetable_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_periods" (
    "id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "period_number" INTEGER NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "starts_at" TIME(0) NOT NULL,
    "ends_at" TIME(0) NOT NULL,
    "type" "timetable_period_types" NOT NULL DEFAULT 'LESSON',
    "is_teaching_period" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "timetable_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetables" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "timetable_statuses" NOT NULL DEFAULT 'DRAFT',
    "effective_from" DATE,
    "effective_until" DATE,
    "created_by_id" UUID NOT NULL,
    "published_by_id" UUID,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_entries" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "timetable_id" UUID NOT NULL,
    "configuration_id" UUID NOT NULL,
    "period_id" UUID NOT NULL,
    "day" "timetable_days" NOT NULL,
    "subject_id" UUID NOT NULL,
    "teacher_profile_id" UUID NOT NULL,
    "room_label" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "timetable_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_timetable_configurations_school_id_academic_year_id__idx" ON "school_timetable_configurations"("school_id", "academic_year_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "school_timetable_configurations_school_id_name_academic_yea_key" ON "school_timetable_configurations"("school_id", "name", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_timetable_configurations_id_school_id_key" ON "school_timetable_configurations"("id", "school_id");

-- CreateIndex
CREATE INDEX "timetable_periods_configuration_id_starts_at_idx" ON "timetable_periods"("configuration_id", "starts_at");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_periods_configuration_id_period_number_key" ON "timetable_periods"("configuration_id", "period_number");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_periods_id_configuration_id_key" ON "timetable_periods"("id", "configuration_id");

-- CreateIndex
CREATE INDEX "timetables_school_id_academic_year_id_status_idx" ON "timetables"("school_id", "academic_year_id", "status");

-- CreateIndex
CREATE INDEX "timetables_school_id_section_id_status_idx" ON "timetables"("school_id", "section_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "timetables_id_school_id_key" ON "timetables"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetables_school_id_section_id_academic_year_id_version_key" ON "timetables"("school_id", "section_id", "academic_year_id", "version");

-- CreateIndex
CREATE INDEX "timetable_entries_school_id_timetable_id_day_period_id_idx" ON "timetable_entries"("school_id", "timetable_id", "day", "period_id");

-- CreateIndex
CREATE INDEX "timetable_entries_school_id_teacher_profile_id_day_idx" ON "timetable_entries"("school_id", "teacher_profile_id", "day");

-- CreateIndex
CREATE INDEX "timetable_entries_school_id_subject_id_idx" ON "timetable_entries"("school_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_entries_id_school_id_key" ON "timetable_entries"("id", "school_id");

-- AddForeignKey
ALTER TABLE "school_timetable_configurations" ADD CONSTRAINT "school_timetable_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_timetable_configurations" ADD CONSTRAINT "school_timetable_configurations_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_timetable_configurations" ADD CONSTRAINT "school_timetable_configurations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_periods" ADD CONSTRAINT "timetable_periods_configuration_id_fkey" FOREIGN KEY ("configuration_id") REFERENCES "school_timetable_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_configuration_id_school_id_fkey" FOREIGN KEY ("configuration_id", "school_id") REFERENCES "school_timetable_configurations"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_timetable_id_school_id_fkey" FOREIGN KEY ("timetable_id", "school_id") REFERENCES "timetables"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_period_id_configuration_id_fkey" FOREIGN KEY ("period_id", "configuration_id") REFERENCES "timetable_periods"("id", "configuration_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_subject_id_school_id_fkey" FOREIGN KEY ("subject_id", "school_id") REFERENCES "subjects"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_teacher_profile_id_school_id_fkey" FOREIGN KEY ("teacher_profile_id", "school_id") REFERENCES "teacher_profiles"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
