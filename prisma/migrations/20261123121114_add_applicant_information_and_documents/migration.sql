/*
  Warnings:

  - A unique constraint covering the columns `[id,school_id]` on the table `admission_applications` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "admission_document_types" AS ENUM ('BIRTH_CERTIFICATE', 'PREVIOUS_REPORT_CARD', 'TRANSFER_CERTIFICATE', 'IDENTIFICATION', 'PHOTOGRAPH', 'OTHER');

-- CreateTable
CREATE TABLE "applicant_information" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "phone_number" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "previous_school" TEXT,
    "guardian_name" TEXT,
    "guardian_relation" TEXT,
    "guardian_phone" TEXT,
    "guardian_email" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "applicant_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_documents" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "document_type" "admission_document_types" NOT NULL,
    "original_filename" TEXT NOT NULL,
    "stored_filename" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "admission_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applicant_information_school_phone_idx" ON "applicant_information"("school_id", "phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_information_application_school_key" ON "applicant_information"("application_id", "school_id");

-- CreateIndex
CREATE INDEX "admission_documents_school_application_idx" ON "admission_documents"("school_id", "application_id");

-- CreateIndex
CREATE INDEX "admission_documents_uploaded_by_idx" ON "admission_documents"("uploaded_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "admission_applications_id_school_key" ON "admission_applications"("id", "school_id");

-- AddForeignKey
ALTER TABLE "applicant_information" ADD CONSTRAINT "applicant_information_application_id_school_id_fkey" FOREIGN KEY ("application_id", "school_id") REFERENCES "admission_applications"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_documents" ADD CONSTRAINT "admission_documents_application_id_school_id_fkey" FOREIGN KEY ("application_id", "school_id") REFERENCES "admission_applications"("id", "school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_documents" ADD CONSTRAINT "admission_documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
