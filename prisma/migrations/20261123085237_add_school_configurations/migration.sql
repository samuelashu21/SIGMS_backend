-- CreateEnum
CREATE TYPE "school_languages" AS ENUM ('ENGLISH', 'AMHARIC');

-- CreateEnum
CREATE TYPE "school_calendar_types" AS ENUM ('GREGORIAN', 'ETHIOPIAN');

-- CreateTable
CREATE TABLE "school_configurations" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "default_language" "school_languages" NOT NULL DEFAULT 'ENGLISH',
    "calendar_type" "school_calendar_types" NOT NULL DEFAULT 'GREGORIAN',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Addis_Ababa',
    "academic_year_label" TEXT NOT NULL DEFAULT 'GREGORIAN',
    "attendance_enabled" BOOLEAN NOT NULL DEFAULT true,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "parent_access_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "school_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_configurations_school_id_key" ON "school_configurations"("school_id");

-- AddForeignKey
ALTER TABLE "school_configurations" ADD CONSTRAINT "school_configurations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
