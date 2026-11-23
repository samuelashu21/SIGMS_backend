-- CreateEnum
CREATE TYPE "academic_calendar_event_types" AS ENUM ('TERM_START', 'TERM_END', 'SCHOOL_DAY', 'HOLIDAY', 'EXAMINATION', 'REGISTRATION', 'MEETING', 'CULTURAL_EVENT', 'OTHER');

-- CreateTable
CREATE TABLE "academic_calendar_events" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" "academic_calendar_event_types" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_all_day" BOOLEAN NOT NULL DEFAULT true,
    "location" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_events_school_dates_idx" ON "academic_calendar_events"("school_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "calendar_events_school_year_idx" ON "academic_calendar_events"("school_id", "academic_year_id");

-- CreateIndex
CREATE INDEX "calendar_events_school_type_idx" ON "academic_calendar_events"("school_id", "event_type");

-- CreateIndex
CREATE INDEX "calendar_events_school_published_idx" ON "academic_calendar_events"("school_id", "is_published");

-- AddForeignKey
ALTER TABLE "academic_calendar_events" ADD CONSTRAINT "academic_calendar_events_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_calendar_events" ADD CONSTRAINT "academic_calendar_events_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
