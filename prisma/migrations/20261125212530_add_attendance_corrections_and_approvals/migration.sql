/*
  Warnings:

  - A unique constraint covering the columns `[id,school_id]` on the table `attendance_records` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "attendance_corrections" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "attendance_record_id" UUID NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "previous_status" "attendance_statuses" NOT NULL,
    "requested_status" "attendance_statuses" NOT NULL,
    "reason" TEXT NOT NULL,
    "review_notes" TEXT,
    "status" "attendance_correction_statuses" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attendance_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_corrections_record_idx" ON "attendance_corrections"("school_id", "attendance_record_id");

-- CreateIndex
CREATE INDEX "attendance_corrections_status_idx" ON "attendance_corrections"("school_id", "status", "requested_at");

-- CreateIndex
CREATE INDEX "attendance_corrections_requester_idx" ON "attendance_corrections"("school_id", "requested_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_corrections_id_school_key" ON "attendance_corrections"("id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_id_school_key" ON "attendance_records"("id", "school_id");

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_attendance_record_id_school_id_fkey" FOREIGN KEY ("attendance_record_id", "school_id") REFERENCES "attendance_records"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
