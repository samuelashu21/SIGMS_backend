-- CreateEnum
CREATE TYPE "student_transfer_statuses" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "student_transfer_types" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "academic_enrollment_statuses" AS ENUM ('ACTIVE', 'SUSPENDED', 'WITHDRAWN', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "academic_enrollments" ADD COLUMN     "status" "academic_enrollment_statuses" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "status_changed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status_reason" TEXT;

-- CreateTable
CREATE TABLE "student_transfers" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "source_school_id" UUID NOT NULL,
    "destination_school_id" UUID,
    "transferType" "student_transfer_types" NOT NULL,
    "status" "student_transfer_statuses" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "decision_reason" TEXT,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "student_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_transfers_source_status_idx" ON "student_transfers"("source_school_id", "status");

-- CreateIndex
CREATE INDEX "student_transfers_destination_status_idx" ON "student_transfers"("destination_school_id", "status");

-- CreateIndex
CREATE INDEX "student_transfers_student_requested_idx" ON "student_transfers"("student_id", "requested_at");

-- AddForeignKey
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_student_id_source_school_id_fkey" FOREIGN KEY ("student_id", "source_school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_source_school_id_fkey" FOREIGN KEY ("source_school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_destination_school_id_fkey" FOREIGN KEY ("destination_school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transfers" ADD CONSTRAINT "student_transfers_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
