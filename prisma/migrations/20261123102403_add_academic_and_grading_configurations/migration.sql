-- CreateEnum
CREATE TYPE "academic_term_types" AS ENUM ('SEMESTER', 'QUARTER', 'TRIMESTER', 'ANNUAL');

-- CreateTable
CREATE TABLE "academic_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "term_type" "academic_term_types" NOT NULL DEFAULT 'SEMESTER',
    "terms_per_year" INTEGER NOT NULL DEFAULT 2,
    "passing_percentage" DECIMAL(5,2) NOT NULL DEFAULT 50,
    "maximum_score" DECIMAL(7,2) NOT NULL DEFAULT 100,
    "allow_marks_correction" BOOLEAN NOT NULL DEFAULT false,
    "require_marks_approval" BOOLEAN NOT NULL DEFAULT true,
    "allow_incomplete_grades" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_systems" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "grading_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_scales" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "grading_system_id" UUID NOT NULL,
    "letter_grade" TEXT NOT NULL,
    "minimum_score" DECIMAL(7,2) NOT NULL,
    "maximum_score" DECIMAL(7,2) NOT NULL,
    "grade_point" DECIMAL(5,2),
    "description" TEXT,
    "is_passing" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "grade_scales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_configurations_school_id_key" ON "academic_configurations"("school_id");

-- CreateIndex
CREATE INDEX "grading_systems_school_active_idx" ON "grading_systems"("school_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "grading_systems_school_name_key" ON "grading_systems"("school_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "grading_systems_id_school_key" ON "grading_systems"("id", "school_id");

-- CreateIndex
CREATE INDEX "grade_scales_school_system_idx" ON "grade_scales"("school_id", "grading_system_id");

-- CreateIndex
CREATE UNIQUE INDEX "grade_scales_system_letter_key" ON "grade_scales"("grading_system_id", "letter_grade");

-- AddForeignKey
ALTER TABLE "academic_configurations" ADD CONSTRAINT "academic_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_systems" ADD CONSTRAINT "grading_systems_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_scales" ADD CONSTRAINT "grade_scales_grading_system_id_school_id_fkey" FOREIGN KEY ("grading_system_id", "school_id") REFERENCES "grading_systems"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;
