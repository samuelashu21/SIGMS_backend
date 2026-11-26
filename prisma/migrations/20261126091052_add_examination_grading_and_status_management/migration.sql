-- CreateEnum
CREATE TYPE "examination_grading_methods" AS ENUM ('NUMERIC', 'PERCENTAGE', 'LETTER_GRADE', 'PASS_FAIL');

-- CreateEnum
CREATE TYPE "examination_rounding_modes" AS ENUM ('ROUND', 'ROUND_UP', 'ROUND_DOWN');

-- AlterTable
ALTER TABLE "examinations" ADD COLUMN     "status_reason" TEXT;

-- CreateTable
CREATE TABLE "examination_grading_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "grading_method" "examination_grading_methods" NOT NULL DEFAULT 'NUMERIC',
    "maximum_marks" DECIMAL(8,2) NOT NULL,
    "passing_marks" DECIMAL(8,2) NOT NULL,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "rounding_mode" "examination_rounding_modes" NOT NULL DEFAULT 'ROUND',
    "allow_negative_marks" BOOLEAN NOT NULL DEFAULT false,
    "negative_mark_value" DECIMAL(8,2),
    "allow_bonus_marks" BOOLEAN NOT NULL DEFAULT false,
    "maximum_bonus_marks" DECIMAL(8,2),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "examination_grading_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examination_grading_configurations_school_id_idx" ON "examination_grading_configurations"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_grading_configs_examination_school_key" ON "examination_grading_configurations"("examination_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "examination_grading_configurations_id_school_id_key" ON "examination_grading_configurations"("id", "school_id");

-- AddForeignKey
ALTER TABLE "examination_grading_configurations" ADD CONSTRAINT "examination_grading_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_grading_configurations" ADD CONSTRAINT "examination_grading_configurations_examination_id_school_i_fkey" FOREIGN KEY ("examination_id", "school_id") REFERENCES "examinations"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;
