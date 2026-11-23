/*
  Warnings:

  - A unique constraint covering the columns `[id,school_id]` on the table `sections` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "teacher_class_assignments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "teacher_class_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homeroom_teacher_assignments" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "homeroom_teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_class_assignment_section_year_idx" ON "teacher_class_assignments"("school_id", "section_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "teacher_class_assignment_teacher_year_idx" ON "teacher_class_assignments"("school_id", "teacher_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_class_assignment_key" ON "teacher_class_assignments"("school_id", "teacher_id", "section_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "homeroom_teacher_active_idx" ON "homeroom_teacher_assignments"("school_id", "teacher_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "homeroom_section_year_key" ON "homeroom_teacher_assignments"("school_id", "section_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "homeroom_teacher_year_key" ON "homeroom_teacher_assignments"("school_id", "teacher_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "sections_id_school_key" ON "sections"("id", "school_id");

-- AddForeignKey
ALTER TABLE "teacher_class_assignments" ADD CONSTRAINT "teacher_class_assignments_teacher_id_school_id_fkey" FOREIGN KEY ("teacher_id", "school_id") REFERENCES "teacher_profiles"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_assignments" ADD CONSTRAINT "teacher_class_assignments_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_class_assignments" ADD CONSTRAINT "teacher_class_assignments_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeroom_teacher_assignments" ADD CONSTRAINT "homeroom_teacher_assignments_teacher_id_school_id_fkey" FOREIGN KEY ("teacher_id", "school_id") REFERENCES "teacher_profiles"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeroom_teacher_assignments" ADD CONSTRAINT "homeroom_teacher_assignments_section_id_school_id_fkey" FOREIGN KEY ("section_id", "school_id") REFERENCES "sections"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeroom_teacher_assignments" ADD CONSTRAINT "homeroom_teacher_assignments_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
