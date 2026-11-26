-- CreateEnum
CREATE TYPE "mark_correction_statuses" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "mark_records" ADD COLUMN     "published_at" TIMESTAMPTZ(3),
ADD COLUMN     "published_by_id" UUID;

-- CreateTable
CREATE TABLE "mark_corrections" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "mark_record_id" UUID NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "previous_obtained_marks" DECIMAL(8,2) NOT NULL,
    "requested_obtained_marks" DECIMAL(8,2) NOT NULL,
    "previous_bonus_marks" DECIMAL(8,2) NOT NULL,
    "requested_bonus_marks" DECIMAL(8,2) NOT NULL,
    "previous_penalty_marks" DECIMAL(8,2) NOT NULL,
    "requested_penalty_marks" DECIMAL(8,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "review_notes" TEXT,
    "status" "mark_correction_statuses" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(3),

    CONSTRAINT "mark_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mark_corrections_school_id_mark_record_id_status_idx" ON "mark_corrections"("school_id", "mark_record_id", "status");

-- CreateIndex
CREATE INDEX "mark_corrections_school_id_requested_at_idx" ON "mark_corrections"("school_id", "requested_at");

-- CreateIndex
CREATE UNIQUE INDEX "mark_corrections_id_school_id_key" ON "mark_corrections"("id", "school_id");

-- AddForeignKey
ALTER TABLE "mark_records" ADD CONSTRAINT "mark_records_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_corrections" ADD CONSTRAINT "mark_corrections_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_corrections" ADD CONSTRAINT "mark_corrections_mark_record_id_school_id_fkey" FOREIGN KEY ("mark_record_id", "school_id") REFERENCES "mark_records"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_corrections" ADD CONSTRAINT "mark_corrections_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_corrections" ADD CONSTRAINT "mark_corrections_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
