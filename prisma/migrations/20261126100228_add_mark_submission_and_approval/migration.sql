-- AlterTable
ALTER TABLE "mark_records" ADD COLUMN     "approval_notes" TEXT,
ADD COLUMN     "reviewed_by_id" UUID;

-- AddForeignKey
ALTER TABLE "mark_records" ADD CONSTRAINT "mark_records_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
