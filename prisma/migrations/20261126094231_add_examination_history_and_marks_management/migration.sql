-- CreateEnum
CREATE TYPE "examination_history_actions" AS ENUM ('CREATED', 'UPDATED', 'SCHEDULED', 'STATUS_CHANGED', 'GRADING_CONFIGURED', 'GRADING_UPDATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "mark_record_statuses" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "examination_history" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "performed_by_id" UUID NOT NULL,
    "action" "examination_history_actions" NOT NULL,
    "previous_status" "examination_statuses",
    "new_status" "examination_statuses",
    "description" TEXT,
    "changes" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "examination_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mark_records" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "entered_by_id" UUID NOT NULL,
    "obtained_marks" DECIMAL(8,2) NOT NULL,
    "bonus_marks" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "penalty_marks" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "status" "mark_record_statuses" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMPTZ(3),
    "approved_at" TIMESTAMPTZ(3),
    "approved_by_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "mark_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "examination_history_school_id_examination_id_created_at_idx" ON "examination_history"("school_id", "examination_id", "created_at");

-- CreateIndex
CREATE INDEX "examination_history_school_id_action_created_at_idx" ON "examination_history"("school_id", "action", "created_at");

-- CreateIndex
CREATE INDEX "examination_history_performed_by_id_created_at_idx" ON "examination_history"("performed_by_id", "created_at");

-- CreateIndex
CREATE INDEX "mark_records_school_id_examination_id_status_idx" ON "mark_records"("school_id", "examination_id", "status");

-- CreateIndex
CREATE INDEX "mark_records_school_id_student_id_idx" ON "mark_records"("school_id", "student_id");

-- CreateIndex
CREATE INDEX "mark_records_entered_by_id_created_at_idx" ON "mark_records"("entered_by_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "mark_records_school_id_examination_id_student_id_key" ON "mark_records"("school_id", "examination_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "mark_records_id_school_id_key" ON "mark_records"("id", "school_id");

-- AddForeignKey
ALTER TABLE "examination_history" ADD CONSTRAINT "examination_history_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_history" ADD CONSTRAINT "examination_history_examination_id_school_id_fkey" FOREIGN KEY ("examination_id", "school_id") REFERENCES "examinations"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examination_history" ADD CONSTRAINT "examination_history_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_records" ADD CONSTRAINT "mark_records_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_records" ADD CONSTRAINT "mark_records_examination_id_school_id_fkey" FOREIGN KEY ("examination_id", "school_id") REFERENCES "examinations"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_records" ADD CONSTRAINT "mark_records_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_records" ADD CONSTRAINT "mark_records_entered_by_id_fkey" FOREIGN KEY ("entered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_records" ADD CONSTRAINT "mark_records_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
