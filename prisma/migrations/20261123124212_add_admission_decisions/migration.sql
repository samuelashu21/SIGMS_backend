-- AlterTable
ALTER TABLE "admission_applications" ADD COLUMN     "decision_at" TIMESTAMPTZ(3),
ADD COLUMN     "decision_by_id" UUID,
ADD COLUMN     "decision_reason" TEXT;

-- AddForeignKey
ALTER TABLE "admission_applications" ADD CONSTRAINT "admission_applications_decision_by_id_fkey" FOREIGN KEY ("decision_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
