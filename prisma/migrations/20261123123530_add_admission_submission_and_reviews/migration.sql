-- CreateEnum
CREATE TYPE "admission_review_types" AS ENUM ('GENERAL_REVIEW', 'DOCUMENT_REVIEW', 'ELIGIBILITY_REVIEW', 'RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION', 'REQUEST_INFORMATION');

-- AlterTable
ALTER TABLE "admission_applications" ADD COLUMN     "submitted_at" TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "admission_reviews" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "review_type" "admission_review_types" NOT NULL,
    "comments" TEXT NOT NULL,
    "reviewed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admission_reviews_school_application_idx" ON "admission_reviews"("school_id", "application_id", "reviewed_at");

-- CreateIndex
CREATE INDEX "admission_reviews_reviewer_date_idx" ON "admission_reviews"("reviewer_id", "reviewed_at");

-- AddForeignKey
ALTER TABLE "admission_reviews" ADD CONSTRAINT "admission_reviews_application_id_school_id_fkey" FOREIGN KEY ("application_id", "school_id") REFERENCES "admission_applications"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_reviews" ADD CONSTRAINT "admission_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
