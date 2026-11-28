-- AlterTable
ALTER TABLE "timetables" ADD COLUMN     "approval_remarks" TEXT,
ADD COLUMN     "approved_at" TIMESTAMPTZ(3),
ADD COLUMN     "approved_by_id" UUID,
ADD COLUMN     "publication_remarks" TEXT,
ADD COLUMN     "submission_remarks" TEXT,
ADD COLUMN     "submitted_at" TIMESTAMPTZ(3),
ADD COLUMN     "submitted_by_id" UUID;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
