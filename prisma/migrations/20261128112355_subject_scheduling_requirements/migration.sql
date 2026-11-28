-- CreateTable
CREATE TABLE "subject_scheduling_requirements" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "required_periods_per_week" INTEGER NOT NULL,
    "maximum_periods_per_day" INTEGER NOT NULL DEFAULT 1,
    "allow_consecutive_periods" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "subject_scheduling_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subject_scheduling_requirements_school_id_academic_year_id__idx" ON "subject_scheduling_requirements"("school_id", "academic_year_id", "grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_scheduling_requirements_school_id_academic_year_id__key" ON "subject_scheduling_requirements"("school_id", "academic_year_id", "grade_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_scheduling_requirements_id_school_id_key" ON "subject_scheduling_requirements"("id", "school_id");

-- AddForeignKey
ALTER TABLE "subject_scheduling_requirements" ADD CONSTRAINT "subject_scheduling_requirements_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_scheduling_requirements" ADD CONSTRAINT "subject_scheduling_requirements_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_scheduling_requirements" ADD CONSTRAINT "subject_scheduling_requirements_grade_id_school_id_fkey" FOREIGN KEY ("grade_id", "school_id") REFERENCES "grades"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_scheduling_requirements" ADD CONSTRAINT "subject_scheduling_requirements_subject_id_school_id_fkey" FOREIGN KEY ("subject_id", "school_id") REFERENCES "subjects"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
