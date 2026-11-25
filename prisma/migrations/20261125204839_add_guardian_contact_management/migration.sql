-- CreateEnum
CREATE TYPE "guardian_contact_types" AS ENUM ('PHONE', 'EMAIL', 'ADDRESS', 'EMERGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "guardian_contact_channels" AS ENUM ('SMS', 'EMAIL', 'PHONE_CALL', 'IN_APP');

-- CreateTable
CREATE TABLE "guardian_contacts" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "guardian_id" UUID NOT NULL,
    "contact_type" "guardian_contact_types" NOT NULL,
    "label" TEXT,
    "value" TEXT NOT NULL,
    "channel" "guardian_contact_channels",
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "guardian_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guardian_contacts_guardian_type_idx" ON "guardian_contacts"("school_id", "guardian_id", "contact_type");

-- CreateIndex
CREATE INDEX "guardian_contacts_primary_idx" ON "guardian_contacts"("school_id", "guardian_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_contacts_id_school_key" ON "guardian_contacts"("id", "school_id");

-- AddForeignKey
ALTER TABLE "guardian_contacts" ADD CONSTRAINT "guardian_contacts_guardian_id_school_id_fkey" FOREIGN KEY ("guardian_id", "school_id") REFERENCES "guardian_profiles"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
