/*
  Warnings:

  - You are about to drop the column `schoolId` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[admission_application_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,school_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `school_id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_schoolId_fkey";

-- DropIndex
DROP INDEX "students_school_active_idx";

-- DropIndex
DROP INDEX "students_school_id_idx";

-- DropIndex
DROP INDEX "students_school_name_idx";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "schoolId",
ADD COLUMN     "admission_application_id" UUID,
ADD COLUMN     "date_of_birth" DATE,
ADD COLUMN     "gender" "applicant_genders",
ADD COLUMN     "school_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "previous_school" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_profiles_school_id_idx" ON "student_profiles"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_student_school_key" ON "student_profiles"("student_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_admission_application_id_key" ON "students"("admission_application_id");

-- CreateIndex
CREATE INDEX "students_school_id_idx" ON "students"("school_id");

-- CreateIndex
CREATE INDEX "students_school_active_idx" ON "students"("school_id", "is_active");

-- CreateIndex
CREATE INDEX "students_school_name_idx" ON "students"("school_id", "full_name");

-- CreateIndex
CREATE UNIQUE INDEX "students_id_school_key" ON "students"("id", "school_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_admission_application_id_fkey" FOREIGN KEY ("admission_application_id") REFERENCES "admission_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;
