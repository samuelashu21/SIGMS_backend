-- CreateTable
CREATE TABLE "semester_academic_averages" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "semester_id" UUID NOT NULL,
    "average_percentage" DECIMAL(8,2) NOT NULL,
    "average_grade_point" DECIMAL(5,2),
    "total_subjects" INTEGER NOT NULL,
    "passed_subjects" INTEGER NOT NULL DEFAULT 0,
    "failed_subjects" INTEGER NOT NULL DEFAULT 0,
    "calculation_details" JSONB,
    "calculated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "semester_academic_averages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annual_academic_averages" (
    "id" UUID NOT NULL,
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "average_percentage" DECIMAL(8,2) NOT NULL,
    "average_grade_point" DECIMAL(5,2),
    "total_semesters" INTEGER NOT NULL,
    "passed_semesters" INTEGER NOT NULL DEFAULT 0,
    "failed_semesters" INTEGER NOT NULL DEFAULT 0,
    "calculation_details" JSONB,
    "calculated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "annual_academic_averages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "semester_academic_averages_school_id_academic_year_id_semes_idx" ON "semester_academic_averages"("school_id", "academic_year_id", "semester_id");

-- CreateIndex
CREATE INDEX "semester_academic_averages_school_id_student_id_academic_ye_idx" ON "semester_academic_averages"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "semester_academic_averages_school_id_student_id_academic_ye_key" ON "semester_academic_averages"("school_id", "student_id", "academic_year_id", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "semester_academic_averages_id_school_id_key" ON "semester_academic_averages"("id", "school_id");

-- CreateIndex
CREATE INDEX "annual_academic_averages_school_id_academic_year_id_average_idx" ON "annual_academic_averages"("school_id", "academic_year_id", "average_percentage");

-- CreateIndex
CREATE INDEX "annual_academic_averages_school_id_student_id_academic_year_idx" ON "annual_academic_averages"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "annual_academic_averages_school_id_student_id_academic_year_key" ON "annual_academic_averages"("school_id", "student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "annual_academic_averages_id_school_id_key" ON "annual_academic_averages"("id", "school_id");

-- AddForeignKey
ALTER TABLE "semester_academic_averages" ADD CONSTRAINT "semester_academic_averages_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_academic_averages" ADD CONSTRAINT "semester_academic_averages_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_academic_averages" ADD CONSTRAINT "semester_academic_averages_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester_academic_averages" ADD CONSTRAINT "semester_academic_averages_semester_id_school_id_fkey" FOREIGN KEY ("semester_id", "school_id") REFERENCES "semesters"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annual_academic_averages" ADD CONSTRAINT "annual_academic_averages_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annual_academic_averages" ADD CONSTRAINT "annual_academic_averages_student_id_school_id_fkey" FOREIGN KEY ("student_id", "school_id") REFERENCES "students"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annual_academic_averages" ADD CONSTRAINT "annual_academic_averages_academic_year_id_school_id_fkey" FOREIGN KEY ("academic_year_id", "school_id") REFERENCES "academic_years"("id", "school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
