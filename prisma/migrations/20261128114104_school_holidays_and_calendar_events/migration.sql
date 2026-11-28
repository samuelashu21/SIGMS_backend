-- CreateEnum
CREATE TYPE "school_holiday_types" AS ENUM ('PUBLIC_HOLIDAY', 'RELIGIOUS_HOLIDAY', 'SCHOOL_BREAK', 'EMERGENCY_CLOSURE', 'OTHER');

-- CreateTable
CREATE TABLE "school_holidays" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "type" "school_holiday_types" NOT NULL DEFAULT 'OTHER',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "school_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "school_holidays_school_id_academic_year_id_start_date_end_d_idx" ON "school_holidays"("school_id", "academic_year_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "school_holidays_school_id_is_active_idx" ON "school_holidays"("school_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "school_holidays_id_school_id_key" ON "school_holidays"("id", "school_id");

-- AddForeignKey
ALTER TABLE "school_holidays" ADD CONSTRAINT "school_holidays_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_holidays" ADD CONSTRAINT "school_holidays_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_holidays" ADD CONSTRAINT "school_holidays_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
