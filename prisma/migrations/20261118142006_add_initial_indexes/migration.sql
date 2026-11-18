/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `students` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

-- CreateIndex
CREATE INDEX "schools_is_active_idx" ON "schools"("is_active");

-- CreateIndex
CREATE INDEX "students_school_id_idx" ON "students"("schoolId");

-- CreateIndex
CREATE INDEX "students_school_active_idx" ON "students"("schoolId", "is_active");

-- CreateIndex
CREATE INDEX "students_school_name_idx" ON "students"("schoolId", "full_name");
